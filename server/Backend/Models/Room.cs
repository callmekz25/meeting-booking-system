namespace Backend.Models;

public class Room
{
    public int RoomID { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public int Capacity { get; set; }
    public string Email { get; set; }
    public bool IsAvailable { get; set; }

    // Navigation
    public ICollection<RoomEquipment> RoomEquipments { get; set; }
    public ICollection<Booking> Bookings { get; set; }
}