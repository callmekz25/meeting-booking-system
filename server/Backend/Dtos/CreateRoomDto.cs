namespace Backend.Dtos;


public class AssignEquipmentDto
{
    public int InventoryID { get; set; }
    public int Quantity { get; set; }
}

public class CreateRoomDto
{
    public string Name { get; set; }
    public int Capacity { get; set; }
    public string Code { get; set; }
    public List<AssignEquipmentDto> AssignEquipments { get; set; }
    
}