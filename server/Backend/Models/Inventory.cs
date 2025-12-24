namespace Backend.Models;

public enum InventoryStatus
{
    Available,
    Maintenance,
    OutOfService,
}


public class Inventory
{
    public int InventoryID { get; set; }
    public int TypeID { get; set; }
    public string SerialNumber { get; set; }
    public string Status { get; set; }
    public int Quantity { get; set; }
    // Navigation
    public EquipmentType EquipmentType { get; set; }
    public ICollection<InventoryHistory> InventoryHistories { get; set; }
    public ICollection<RoomEquipment> RoomEquipments { get; set; }
}