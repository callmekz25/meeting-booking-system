namespace Backend.Dtos;

public class RoomEquipmentDefaultDto
{
    public int InventoryID { get; set; }
    public int TypeID { get; set; }
    public string TypeName { get; set; }

    public string SerialNumber { get; set; }
    public string Status { get; set; }
    public int InventoryQuantity { get; set; }
    public int AssignQuantity  { get; set; }
}

