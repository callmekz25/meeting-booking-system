namespace Backend.Dtos;

public class StaticsInventoryDto
{
    public int Total { get; set; }
    public int TotalAvailable { get; set; }
    public int TotalOutOfService  { get; set; }
    public int TotalMaintenance { get; set; }
}