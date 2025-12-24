using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;


[ApiController]
[Route("api/equipment-type")]
[Authorize]
public class EquipmentTypeController : ControllerBase
{
    private readonly EquipmentTypeService _service;
    
    public  EquipmentTypeController(EquipmentTypeService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetEquipmentType()
    {
        var result = await _service.GetEquipmentType();
        
        return result.Success ? Ok(result) : BadRequest(result);
    }
    
}