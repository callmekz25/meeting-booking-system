namespace Backend.Models;

public class EquipmentType
{
    public int TypeID { get; set; }
    public string TypeName { get; set; }

    // Navigation
    public ICollection<Inventory> Inventories { get; set; }
}