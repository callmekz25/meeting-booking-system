
using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UserController : ControllerBase
{
 
    private readonly UserService _service;
    
    public UserController(UserService userService)
    {
        _service = userService;
    }
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var result = await _service.GetMe();
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, result);
        }
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetUserByEmail([FromQuery] string? Email, string StartTime, string EndTime)
    {
        DateTime start = DateTime.Parse(StartTime);
        DateTime end = DateTime.Parse(EndTime);
        var result = await _service.GetUsersByEmail(Email, start, end);

        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var result = await _service.GetRoles();
        
        return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
    }
    
    [Authorize(Roles = "Admin")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllUsers([FromQuery] string? Email, int Page)
    {
        int page = Page < 0 ? 1 : Page;
        var result = await _service.GetAllUsers(page, Email);
        
        return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser([FromRoute] string id, [FromBody] UpdateUserDto user)
    {
        var result = await _service.UpdateUser(id, user);
        
        return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
    }
    
}