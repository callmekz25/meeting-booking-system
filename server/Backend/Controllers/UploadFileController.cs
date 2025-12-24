using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;



[ApiController]
[Route("api/upload")]
public class UploadFileController : ControllerBase
{

    private readonly UploadFileService _uploadFileService;
    
    public UploadFileController(UploadFileService uploadFileService)
    {
        _uploadFileService = uploadFileService;
    }


    [HttpPost]
    public async Task<IActionResult> UploadFile([FromForm] IFormFile file)
    {
        var resultExtract = await _uploadFileService.ExtractFile(file);

        if (!resultExtract.Success)
        {
            return StatusCode(resultExtract.StatusCode, resultExtract);
        }

        var resultInsert = await _uploadFileService.HandleInsertData(resultExtract.Data.InventoryCsvDto, resultExtract.Data.FilePath);
        
        
        return resultInsert.Success ? Ok(resultInsert) : StatusCode(resultInsert.StatusCode, resultInsert);
    }
   
}