
using Backend.Common.Models;
using Backend.Dtos;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Backend.RabbitMQ;

namespace Backend.Services;

public class AuthService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly IUnitOfWork _uow;
    private readonly IRabbitMqPublisher _publisher;
    private readonly EmailService _emailService;
    private readonly IHttpContextAccessor _httpContextAccessor;
  

   
 
  
    public AuthService(IUnitOfWork uow, UserManager<User> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration,
        EmailService emailService, IHttpContextAccessor httpContextAccessor, IRabbitMqPublisher publisher, SignInManager<User> signInManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _uow = uow;
        _emailService = emailService;
        _httpContextAccessor = httpContextAccessor;
        _publisher = publisher;
        _signInManager = signInManager;
    }


 
    
    public async Task<ServiceResult<IdentityResult>> CreateUserAsync(CreateUserDto dto)
    {
        try
        {
            
            
            var email = await _userManager.FindByEmailAsync(dto.Email);

            if (email != null)
            {
                return ServiceResult<IdentityResult>.Fail("Email already exists");
            }
            var role = await _roleManager.FindByIdAsync(dto.RoleID);
            
            if (role == null)
            {
                return ServiceResult<IdentityResult>.Fail("Role not found");
            }
            var user = new User
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
            };
            var randomPassword = GenerateRandomPassword();

            var result = await _userManager.CreateAsync(user, randomPassword);

            if (!result.Succeeded)
                return ServiceResult<IdentityResult>.Fail(result.Errors.First().Description);

  
            var roleResult = await _userManager.AddToRoleAsync(user, role.Name!);
            if (!roleResult.Succeeded)
            {
                return ServiceResult<IdentityResult>.Fail(
                    roleResult.Errors.First().Description
                );
            }

            var emailCreateAccountDto = new EmailCreateUserDto
            {
                Name = user.FullName,
                Email = user.Email,
                Password = randomPassword,
                PhoneNumber = user.PhoneNumber,
            };
            await _publisher.SendMessage(emailCreateAccountDto,
                RabbitMqQueues.MailQueue, RabbitMqExchanges.MailExChange,
                RabbitRoutingKeys.CreateAccountMail
            );


            return ServiceResult<IdentityResult>.Ok(result, "Created user successfully");
        }
        catch (Exception e)
        {
            return ServiceResult<IdentityResult>.Fail(e.Message);
        }
        
    }
    
    public async Task<ServiceResult<object?>> Login(LoginDto dto)
    {
        try
        {
            var result = await _signInManager.PasswordSignInAsync(
                dto.Email,
                dto.Password,
                isPersistent: false,
                lockoutOnFailure: true 
            );

            if (result.IsLockedOut)
            {
                return ServiceResult<object?>.Fail("Your account were locked. Please try again after 5 minutes.");
            }

            if (!result.Succeeded)
            {
                return ServiceResult<object?>.Fail("Invalid email or password");
            }
            var user = await _userManager.FindByEmailAsync(dto.Email);

            var roles = await _userManager.GetRolesAsync(user);
            var role =  roles.FirstOrDefault() ?? "NormalUser";
      
            var accessToken = GenerateJwtToken(user, role);
            var refreshToken = GenerateRefreshToken(user.Id);
            await _uow.GetRepository<RefreshToken>().AddAsync(refreshToken);

            await _uow.SaveChangesAsync();
        
            return ServiceResult<object?>.Ok(new {accessToken, refreshToken = refreshToken.Token}, "Login successful");
        }
        catch (Exception e)
        {
            return ServiceResult<object?>.Fail(e.Message);
        }
    }

    public async Task<ServiceResult<object?>> RefreshTokenAsync(TokenDto dto)
    {

        try
        {
            var repo = _uow.GetRepository<RefreshToken>();
            var query = repo.Query();
            var oldRt  = await query.Where(x => x.Token == dto.Token && x.IsRevoked == false && x.ExpiryDate > DateTime.UtcNow).FirstOrDefaultAsync();

            if (oldRt == null)
            {
                return ServiceResult<object?>.Fail("Invalid or expired token");
            }
        
            var user = await _userManager.FindByIdAsync(oldRt.UserId);
            if (user == null)
            {
                return ServiceResult<object?>.Fail("Invalid or expired token");
            }
        
            var roles = await _userManager.GetRolesAsync(user);
            var role =  roles.FirstOrDefault() ?? "NormalUser";
        
            var  newAccessToken = GenerateJwtToken(user, role);
            var  newRefreshToken = GenerateRefreshToken(user.Id);
        
            oldRt.IsRevoked = true;
        
            repo.Update(oldRt);
            await repo.AddAsync(newRefreshToken);

            await _uow.SaveChangesAsync();
        

            return ServiceResult<object?>.Ok(new
            {
                accessToken = newAccessToken,
                refreshToken = newRefreshToken.Token,
            }, "Refresh token successful");
        }
        catch (Exception e)
        {
            return ServiceResult<object?>.Fail(e.Message);
        }

    }


    public async Task<ServiceResult<bool>> ValidatePasswordResetToken(TokenDto dto)
    {
        try
        {
            var token = await _uow.GetRepository<PasswordResetToken>().Query()
                .FirstOrDefaultAsync(t =>
                    t.Token == dto.Token &&
                    !t.IsUsed &&
                    t.ExpireAt > DateTime.UtcNow
                );
            if (token == null)
            {
                return ServiceResult<bool>.Fail("Invalid or expired token");
            }
            return ServiceResult<bool>.Ok(true, "Validate token successful");
        }
        catch (Exception e)
        {
            return ServiceResult<bool>.Fail(e.Message);
        }
       
    }
    
    
    private string GenerateJwtToken(User user, string role)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, role)
        };
     
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    private RefreshToken GenerateRefreshToken(string userId)
    {
        return new RefreshToken
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            ExpiryDate = DateTime.UtcNow.AddDays(7),
            UserId = userId
        };
    }
	
	public async Task<ServiceResult<object?>> LogoutAsync(string refreshToken)
	{
        try
        {
            var repo = _uow.GetRepository<RefreshToken>();
            var query = repo.Query();

            var rt = await query
                .Where(x => x.Token == refreshToken && x.IsRevoked == false)
                .FirstOrDefaultAsync();

            if (rt == null)
            {
                return ServiceResult<object?>.Fail("Expired or invalid token");
            }

            rt.IsRevoked = true;
            repo.Update(rt);

            await _uow.SaveChangesAsync();

            return ServiceResult<object?>.Ok(null,"Logged out successfully");
        }
        catch (Exception e)
        {
            return ServiceResult<object?>.Fail(e.Message);
        }
		
	}
    public async Task<ServiceResult<bool>> SendPasswordResetLinkAsync(string emailOrUsername)
    {
        try
        {
            var repo = _uow.GetRepository<PasswordResetToken>();
            var user = await _userManager.Users.FirstOrDefaultAsync(u =>
                u.Email == emailOrUsername || u.UserName == emailOrUsername);

            var ip = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString()
                     ?? "Unknown";

            if (user == null)
            {
                return ServiceResult<bool>.Fail("Invalid email");
            }
            else
            {
                var recentRequests = await repo.Query()
                   .Where(t => t.UserId == user.Id && t.CreatedAt > DateTime.UtcNow.AddHours(-1))
                   .CountAsync();
                if (recentRequests >= 3)
                    return ServiceResult<bool>.Fail("Limited request");

                var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

                var resetToken = new PasswordResetToken
                {
                    UserId = user.Id,
                    Token = token,
                    ExpireAt = DateTime.UtcNow.AddMinutes(15),
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow,
                    RequestIP = ip
                };

                await repo.AddAsync(resetToken);
                
                await _uow.SaveChangesAsync();
                
                var encodedToken = Uri.EscapeDataString(token);

                var resetLink = $"https://team2info.netlify.app/reset?token={encodedToken}";


               

               
                await _publisher.SendMessage( new PasswordResetEmailDto
                {
                    Email = user.Email,
                    ResetLink = resetLink,
                    UserName = user.FullName,
                }, RabbitMqQueues.MailQueue ,RabbitMqExchanges.MailExChange, RabbitRoutingKeys.PasswordResetMail);

            }
   
            return ServiceResult<bool>.Ok(true, "We have sent password reset instructions to that email.");
        }
        catch (Exception e)
        {
            return ServiceResult<bool>.Fail(e.Message);
        }
        
    }

    public async Task<ServiceResult<bool>> ResetPasswordAsync(ResetPasswordDto dto)
    {
        try
        {
            
            if (dto.NewPassword != dto.ConfirmPassword)
            {
                return ServiceResult<bool>.Fail("New password and confirm password do not match");
            }

           
            var tokenRepo = _uow.GetRepository<PasswordResetToken>();

            var resetToken = await tokenRepo.Query()
                .FirstOrDefaultAsync(x =>
                    x.Token == dto.Token &&
                    !x.IsUsed &&
                    x.ExpireAt > DateTime.UtcNow);

            if (resetToken == null)
            {
                return ServiceResult<bool>.Fail("Invalid or expired token");
            }

            
            var user = await _userManager.FindByIdAsync(resetToken.UserId);
            if (user == null)
            {
                return ServiceResult<bool>.Fail("Invalid or expired token");
            }

            
            var passwordValidator = new PasswordValidator<User>();
            var passwordValidationResult = await passwordValidator
                .ValidateAsync(_userManager, user, dto.NewPassword);

            if (!passwordValidationResult.Succeeded)
            {
                var error = passwordValidationResult.Errors.First().Description;
                return ServiceResult<bool>.Fail(error);
            }

           
            var identityResetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetResult = await _userManager.ResetPasswordAsync(
                user,
                identityResetToken,
                dto.NewPassword);

            if (!resetResult.Succeeded)
            {
                var error = resetResult.Errors.First().Description;
                return ServiceResult<bool>.Fail(error);
            }

            
            resetToken.IsUsed = true;
            tokenRepo.Update(resetToken);

            await _uow.SaveChangesAsync();

            
            await _emailService.SendPasswordChangeConfirmationEmail(
                user.Email!,
                user.FullName);

            return ServiceResult<bool>.Ok(true, "Password reset successful");
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(ex.Message);
        }
    }


    public async Task<ServiceResult<bool>> ChangePasswordAsync(ChangePasswordDto dto, string userId)
    {
        try
        {
            // 1. Validate userId
            if (string.IsNullOrWhiteSpace(userId))
            {
                return ServiceResult<bool>.Fail("Invalid authenticated user.");
            }

            // 2. Validate confirm password
            if (dto.NewPassword != dto.ConfirmPassword)
            {
                return ServiceResult<bool>.Fail("New password and confirmation do not match.");
            }

            // 3. Find user by Identity Id (IMPORTANT)
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return ServiceResult<bool>.Fail("User not found.");
            }

            // 4. Check current password
            var isCorrect = await _userManager.CheckPasswordAsync(user, dto.CurrentPassword);
            if (!isCorrect)
            {
                return ServiceResult<bool>.Fail("Current password is incorrect.");
            }

            // 5. Validate password rules
            foreach (var validator in _userManager.PasswordValidators)
            {
                var validationResult = await validator.ValidateAsync(
                    _userManager, user, dto.NewPassword);

                if (!validationResult.Succeeded)
                {
                    return ServiceResult<bool>.Fail(
                        validationResult.Errors.First().Description);
                }
            }

            // 6. Change password (Identity tự Save)
            var result = await _userManager.ChangePasswordAsync(
                user,
                dto.CurrentPassword,
                dto.NewPassword);

            if (!result.Succeeded)
            {
                return ServiceResult<bool>.Fail(
                    result.Errors.First().Description);
            }

            // ❌ KHÔNG cần _uow.SaveChangesAsync() (Identity đã xử lý)

            // 7. Publish email event via RabbitMQ
            await _publisher.SendMessage(
                new PasswordChangedEmail
                {
                    UserId = user.Id,
                    Email = user.Email!,
                    FullName = user.FullName!,
                    ChangedAt = DateTime.UtcNow
                },
                RabbitMqQueues.MailQueue,
                RabbitMqExchanges.MailExChange,
                RabbitRoutingKeys.ConfirmChangeMail
            );

            return ServiceResult<bool>.Ok(true, "Password changed successfully.");
        }
        catch (Exception)
        {
            return ServiceResult<bool>.Fail("Change password failed.");
        }
    }

    private static string GenerateRandomPassword(int length = 12)
    {
        const string lower = "abcdefghijklmnopqrstuvwxyz";
        const string upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string digits = "0123456789";
        const string special = "!@#$%^&*()-_=+";

        var all = lower + upper + digits + special;

        var bytes = RandomNumberGenerator.GetBytes(length);
        var chars = new char[length];

        
        chars[0] = lower[bytes[0] % lower.Length];
        chars[1] = upper[bytes[1] % upper.Length];
        chars[2] = digits[bytes[2] % digits.Length];
        chars[3] = special[bytes[3] % special.Length];

        for (int i = 4; i < length; i++)
        {
            chars[i] = all[bytes[i] % all.Length];
        }

        return new string(chars.OrderBy(_ => RandomNumberGenerator.GetInt32(int.MaxValue)).ToArray());
    }

}




