using Backend.Common.Models;
using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _service;
    
    public AuthController(AuthService service)
    {
        _service = service;
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPost("register")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        var result = await _service.CreateUserAsync(dto);

        if (!result.Success)
            return StatusCode(result.StatusCode, result);

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _service.Login(dto);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, result);
        }
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] TokenDto dto)
    {
        var data = await _service.RefreshTokenAsync(dto);
        if (!data.Success)
        {
            return StatusCode(data.StatusCode ,data);
        }
        return Ok(data);
    }
	[HttpPost("logout")]
	public async Task<IActionResult> Logout([FromBody] TokenDto dto)
	{
		var result = await _service.LogoutAsync(dto.Token);

		if (!result.Success)
			return BadRequest(result);

		return Ok(result);
	}
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var result = await _service.SendPasswordResetLinkAsync(dto.EmailOrUsername);

        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
      
        var result = await _service.ResetPasswordAsync(dto);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("validate-password-reset-token")]
    public async Task<IActionResult> ValidatePasswordResetToken([FromBody] TokenDto dto)
    {
        var data = await _service.ValidatePasswordResetToken(dto);

        if (!data.Success)
        {
            return BadRequest(data);
        }
        return Ok(data);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        // Lấy userId từ JWT
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Console.WriteLine("JWT userId = " + userId);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ServiceResult<bool>.Fail("User is not authenticated."));

        // Gọi service
        var result = await _service.ChangePasswordAsync(dto, userId);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }



}