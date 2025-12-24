namespace Backend.Models;

public class RoomEquipment
{
    public int RoomEquipmentID { get; set; }
    public int RoomID { get; set; }
    public int InventoryID { get; set; }
    public int Quantity { get; set; }
    // Navigation
    public Room Room { get; set; }
    public Inventory Inventory { get; set; }
}