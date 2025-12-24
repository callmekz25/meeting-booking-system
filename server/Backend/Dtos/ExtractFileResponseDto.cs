namespace Backend.Dtos;

public class ExtractFileResponseDto
{
    public string FilePath { get; set; }
    public List<InventoryCsvDto> InventoryCsvDto { get; set; }
}