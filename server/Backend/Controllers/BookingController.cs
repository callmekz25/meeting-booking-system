using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingController : ControllerBase
{

    private readonly BookingService _service;
    
    public BookingController(BookingService service) 
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetByRange([FromQuery] GetBookingsDto dto)
    {

        var result = await _service.GetBookingsByRange(dto);

        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] BookingCreateRequest dto)
    {
        var result = await _service.CreateBooking(dto);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateBookingStatus dto)
    {
        var result = await _service.UpdateBookingStatus(id, dto.Status);
        return result.Success ? Ok(result) : BadRequest(result);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBooking([FromRoute] int id, [FromBody] BookingCreateRequest dto)
    {
        var result = await _service.UpdateBooking(id, dto);
        
        return result.Success ? Ok(result) : BadRequest(result);
    }

	[HttpDelete("{id}")]
	public async Task<IActionResult> CancelBooking(int id)
	{
		var result = await _service.CancelBookingAsync(id);
		return result.Success ? Ok(result) : BadRequest(result);
	}


}