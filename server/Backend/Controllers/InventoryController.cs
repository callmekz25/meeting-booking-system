using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
	[ApiController]
	[Route("api/inventories")]
	[Authorize(Roles = "Admin")]
	public class InventoryController : Controller
	{
		private readonly InventoryService _service;
		public InventoryController(InventoryService service)
		{
			_service = service;
		}

		[HttpGet("statics")]
		public async Task<IActionResult> GetStatics()
		{
			var result = await _service.GetStaticsInventory();
			if (!result.Success)
				return StatusCode(result.StatusCode, result);

			return Ok(result);
		}
		
		
		[HttpGet("query")]
		public async Task<IActionResult> GetQuery([FromQuery] string? search = null)
		{
			var result = await _service.GetQuery(search);
			if (!result.Success)
				return StatusCode(result.StatusCode, result);

			return Ok(result);
		}
		
		[HttpGet]
		public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] string? search = null,[FromQuery] string? typeName = null, [FromQuery] InventoryStatus? status = null)
		{
			var result = await _service.GetAllAsync(page, search, typeName, status);
			if (!result.Success)
				return StatusCode(result.StatusCode, result);

			return Ok(result);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetById(int id)
		{
			var result = await _service.GetByIdAsync(id);
			if (!result.Success)
			{
				return BadRequest(result);
			}

			return Ok(result);
		}


		[HttpPost]
		public async Task<IActionResult> CreateInventory([FromBody] CreateInventoryDto dto)
		{
			var result = await _service.CreateInventoryAsync(dto);
			if (!result.Success)
			{
				return BadRequest(result);
			}

			return Ok(result);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateInventory(int id, [FromBody] UpdateInventoryDto dto)
		{	
			var result = await _service.UpdateInventoryAsync(id, dto);

			if (!result.Success)
			{
				return BadRequest(result);
			}

			return Ok(result);
		}

	}
}