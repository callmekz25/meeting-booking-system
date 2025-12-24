using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;
[ApiController]
[Route("api/rooms")]
[Authorize]
public class RoomController : ControllerBase
{
    private readonly RoomService _roomService;
    
    
    public  RoomController(RoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRooms([FromQuery] string StartTime, string EndTime)
    {
        DateTime start = DateTime.Parse(StartTime);
        DateTime end = DateTime.Parse(EndTime);
        
        var result = await _roomService.GetRoomsByDateTime(start, end);
        return result.Success ? Ok(result) : BadRequest(result);
    }
    [HttpGet("all")]
    public async Task<IActionResult> GetAllRooms()
    {
        
        var result = await _roomService.GetAllRooms();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("pagination")]
    public async Task<IActionResult> GetRoomsPagination([FromQuery] int Page, string? Name)
    {
        var result = await _roomService.GetRoomsPagination(Page, Name);
        
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto dto)
    {
        var result = await _roomService.CreateRoom(dto);
        
        return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoom([FromRoute] int id, [FromBody] UpdateRoomDto dto)
    {
        var result = await _roomService.UpdateRoom(id, dto);
        
        return result.Success ? Ok(result) : StatusCode(result.StatusCode, result);
    }
}