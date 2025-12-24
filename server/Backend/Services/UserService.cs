using System.Security.Claims;
using System.Security.Cryptography;
using AutoMapper;
using Backend.Common.Models;
using Backend.Dtos;
using Backend.Interfaces;
using Backend.Models;
using Backend.RabbitMQ;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class UserService
{
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContext;
    private readonly UserManager<User> _userManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRabbitMqPublisher _publisher;
    
    public UserService(IMapper mapper,  IHttpContextAccessor httpContext,  UserManager<User> userManager,  IUnitOfWork unitOfWork, IRabbitMqPublisher publisher)
    {
        
        _mapper = mapper;
        _httpContext = httpContext;
        _userManager = userManager;
        _unitOfWork = unitOfWork;
        _publisher = publisher;
    }


    public async Task<ServiceResult<PageResponse<List<UserDto>>>> GetAllUsers(int Page, string? Email)
    {
        try
        {

            int pageSize = 15;
            int page = Page <= 0 ? 1 : Page;
         
            var currentEmail = _httpContext.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);

            var query =  _unitOfWork.GetRepository<User>().Query();
            var total = await query.CountAsync();
         
            if (!string.IsNullOrEmpty(Email))
            {
                query =  query.Where(u => u.Email.Contains(Email));
            }
            
            
            var users = await query.Where((u) => u.Email != currentEmail).OrderBy(u => u.FullName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize).ToListAsync();
            
     
            var roleMap = await _unitOfWork
                .GetRepository<IdentityRole>()
                .Query()
                .ToDictionaryAsync(r => r.Name, r => r.Id);
            
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                var dto = _mapper.Map<UserDto>(user);
                var roles = await _userManager.GetRolesAsync(user);
                var roleName = roles.FirstOrDefault() ?? "NormalUser";
                dto.Role = roleName;
                
                dto.RoleID = roleMap.TryGetValue(roleName, out var roleId)
                    ? roleId
                    : null;
                userDtos.Add(dto);
            }

            var response = new PageResponse<List<UserDto>>
            {
                Items = userDtos,
                Page = page,
                PageSize = pageSize,
                Total = total,
            };
            return ServiceResult<PageResponse<List<UserDto>>>.Ok(response);

        }
        catch (Exception e)
        {
            return ServiceResult<PageResponse<List<UserDto>>>.Fail(e.Message);
        }
    }

    public async Task<ServiceResult<List<RoleDto>>> GetRoles()
    {
        try
        {
            var repo = _unitOfWork.GetRepository<IdentityRole>();
            
            var roles = await repo.Query().Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name
            }).ToListAsync();
            
            return ServiceResult<List<RoleDto>>.Ok(roles);
        }
        catch (Exception e)
        {
            return ServiceResult<List<RoleDto>>.Fail(e.Message);
        }
    }

    public async Task<ServiceResult<UserDto>> UpdateUser(string userId, UpdateUserDto dto)
    {
        try
        {
            bool isEmailChanged = false;
            string? oldEmailRollback;
            
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return ServiceResult<UserDto>.Fail("User not found", 404);
            }

            oldEmailRollback = user.Email;
            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                !string.Equals(dto.Email, user.Email, StringComparison.OrdinalIgnoreCase))
            {
                var existingUser = await _userManager.FindByEmailAsync(dto.Email);
                if (existingUser != null)
                {
                    return ServiceResult<UserDto>.Fail("Email already exists");
                }

                user.Email = dto.Email;
                user.UserName = dto.Email;
                user.NormalizedEmail = dto.Email.ToUpper();
                user.NormalizedUserName = dto.Email.ToUpper();
                
                isEmailChanged = true;
            }
            
            if (!string.IsNullOrWhiteSpace(dto.FullName))
                user.FullName = dto.FullName;

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
                user.PhoneNumber = dto.PhoneNumber;
            
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                return ServiceResult<UserDto>.Fail(
                    string.Join(", ", updateResult.Errors.Select(e => e.Description))
                );
            }
            if (isEmailChanged)
            {
                string newPassword = GenerateRandomPassword();

                var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
                var resetResult = await _userManager.ResetPasswordAsync(
                    user,
                    resetToken,
                    newPassword
                );

                if (!resetResult.Succeeded)
                {
                    user.Email = oldEmailRollback;
                    user.UserName = oldEmailRollback;
                    user.NormalizedEmail = oldEmailRollback.ToUpper();
                    user.NormalizedUserName = oldEmailRollback.ToUpper();
                    
                    await _userManager.UpdateAsync(user);
                    return ServiceResult<UserDto>.Fail(
                        string.Join(", ", resetResult.Errors.Select(e => e.Description))
                    );
                }

                var emailCreateAccountDto = new EmailCreateUserDto
                {
                    Email = user.Email,
                    Name = user.FullName,
                    Password = newPassword,
                    PhoneNumber = user.PhoneNumber,
                };
                await _publisher.SendMessage(emailCreateAccountDto,
                    RabbitMqQueues.MailQueue, RabbitMqExchanges.MailExChange,
                    RabbitRoutingKeys.CreateAccountMail
                );

               
            }

            
            if (!string.IsNullOrWhiteSpace(dto.RoleID))
            {
                
                var role = await _unitOfWork
                    .GetRepository<IdentityRole>()
                    .Query()
                    .FirstOrDefaultAsync(r => r.Id == dto.RoleID);
                
                if (role == null)
                    return ServiceResult<UserDto>.Fail("Role not found", 404);

                var currentRoles = await _userManager.GetRolesAsync(user);

                if (!currentRoles.Contains(role.Name))
                {
                    await _userManager.RemoveFromRolesAsync(user, currentRoles);
                    await _userManager.AddToRoleAsync(user, role.Name);
                }
            }
            
            var userDto = _mapper.Map<UserDto>(user);
            var roles = await _userManager.GetRolesAsync(user);
            userDto.Role = roles.FirstOrDefault() ?? "NormalUser";

            return ServiceResult<UserDto>.Ok(userDto, "Updated successful");

        }
        catch (Exception e)
        {
            return ServiceResult<UserDto>.Fail(e.Message);
        }
    }
    
    
    public async Task<ServiceResult<UserDto>> GetMe()
    {
        var email = _httpContext.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);
   
        if (email == null)
        {
            return ServiceResult<UserDto>.Fail("Unauthorized", 401);
        }
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return ServiceResult<UserDto>.Fail("Not found", 404);
        }
        var userDto = _mapper.Map<UserDto>(user);
        var roles = await _userManager.GetRolesAsync(user);
        userDto.Role = roles.FirstOrDefault() ?? "NormalUser";

        return ServiceResult<UserDto>.Ok(userDto);
        
    }

    public async Task<ServiceResult<List<UserDto>>> GetUsersByEmail(
        string? Email,
        DateTime startTime,
        DateTime endTime)
    {
        
        
        var currentEmail = _httpContext.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);

        var query =  _unitOfWork.GetRepository<User>().Query();

     
        if (!string.IsNullOrEmpty(Email))
        {
            query =  query.Where(u => u.Email.Contains(Email));
        }
        
        var adminRoleId = await _unitOfWork
            .GetRepository<IdentityRole>()
            .Query()
            .Where(r => r.Name == "Admin")
            .Select(r => r.Id)
            .FirstOrDefaultAsync();
        
        if (adminRoleId != null)
        {
            query = query.Where(u =>
                !_unitOfWork.GetRepository<IdentityUserRole<string>>()
                    .Query()
                    .Any(ur => ur.UserId == u.Id && ur.RoleId == adminRoleId)
            );
        }
        
        var users = await query.Where((u) => u.Email != currentEmail).OrderBy(u => u.Email)
            .Take(5)
            .ToListAsync();

        var userIds = users.Select(u => u.Id).ToList();

    
        var relatedBookings = await _unitOfWork.GetRepository<Booking>()
            .Query()
            .Include(b => b.BookingAttendees)   
            .Where(b =>
                b.BookingAttendees.Any(a => userIds.Contains(a.UserID)) &&
                b.StartTime < endTime &&
                b.EndTime > startTime &&
                b.Status == BookingStatus.Approved.ToString())
            .ToListAsync();

        var userDtos = users.Select(u =>
        {
            bool isBusy = relatedBookings.Any(b =>
                b.BookingAttendees.Any(a => a.UserID == u.Id));

            return new UserDto
            {
                FullName =  u.FullName,
                PhoneNumber =  u.PhoneNumber,
                Role = "NormalUser",
                UserID =  u.Id,
                Email = u.Email,
                IsAvailable = !isBusy
            };
        }).ToList();

        return ServiceResult<List<UserDto>>.Ok(userDtos);
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