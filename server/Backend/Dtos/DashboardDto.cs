namespace Backend.Dtos;

public class RoomUsageDto
{
    public int RoomID { get; set; }
    public string Name { get; set; }
    public int Usage  { get; set; }
}
public class EquipmentUsageDto
{
    public int InventoryID { get; set; }
    public string SerialNumber { get; set; }
    public int TypeID { get; set; }
    public string TypeName { get; set; }
    public int Usage  { get; set; }
}

public class DashboardDto
{
    public int TotalRooms { get; set; }
    public int  AvailableRooms { get; set; }
    public int UnavailableRooms { get; set; }
    public int TotalInventory { get; set; }
    public int AvailableInventory { get; set; }
    public int OutOfServiceInventory { get; set; }
    public int MaintenanceInventory { get; set; }
    public List<RoomUsageDto> TopUsageRooms { get; set; }
    public List<RoomUsageDto> UnderUsageRooms { get; set; }
    public List<RoomUsageDto> RoomsUsage { get; set; }
    public List<EquipmentUsageDto> EquipmentUsage { get; set; }
    
}