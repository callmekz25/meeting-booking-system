namespace Backend.Dtos;

public class RoomDto
{
    public int RoomID { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public int Capacity { get; set; }
    public bool IsAvailable { get; set; }
    public bool IsInUse { get; set; }
    public List<RoomEquipmentDefaultDto> RoomEquipments { get; set; }
}