namespace Backend.Dtos;

public class UpdateRoomDto
{
    public int RoomID { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public int Capacity { get; set; }
    public bool IsAvailable { get; set; }
    public List<AssignEquipmentDto> AssignEquipments { get; set; }
}