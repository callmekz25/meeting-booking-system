namespace Backend.Dtos;

public class CreateUpdateRoomResponse
{
    public int RoomID { get; set; }
    public string Name { get; set; }
    public int Capacity { get; set; }
    public bool IsAvailable { get; set; }
    public string Code { get; set; }
    public List<RoomEquipmentDto> RoomEquipments { get; set; }
}