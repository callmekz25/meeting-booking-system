namespace Backend.Dtos;

public class InventoryJobMailDto
{
    public string FileName { get; set; } = null!;
    public DateTime ExecutedAt { get; set; }
   
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
}
