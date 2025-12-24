namespace Backend.Models;


public enum BookingStatus
{
    Approved,
    Rejected,
    Cancelled
}

public class Booking
{
    public int BookingID { get; set; }
    public int RoomID { get; set; }
    public string RequesterID { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public DateTime DateBook { get; set; }
    public string Status { get; set; }   // Approved, Rejected, Cancelled

    // Navigation
    public Room Room { get; set; }
    public User Requester { get; set; }
    public ICollection<BookingAttendee> BookingAttendees { get; set; }

}