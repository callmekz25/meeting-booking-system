using Backend.Models;

namespace Backend.Dtos;

public class BookingDto
{
    public int BookingID { get; set; }

    public RoomDto Room { get; set; }
    public UserDto Requester { get; set; }
    
    public string? Description { get; set; }

    public string Title { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public DateTime DateBook { get; set; }

    public BookingStatus Status { get; set; }

    public List<UserDto> Attendees { get; set; }
}