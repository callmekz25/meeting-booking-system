namespace Backend.Models;

public class BookingAttendee
{
    public int BookingAttendeeID { get; set; }
    public int BookingID { get; set; }
    public string UserID { get; set; }

    // Navigation
    public Booking Booking { get; set; }
    public User User { get; set; }
}