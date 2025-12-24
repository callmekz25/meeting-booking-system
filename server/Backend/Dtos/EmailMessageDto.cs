namespace Backend.Dtos;

public class EmailMessageDto
{
    public BookingDto Booking { get; set; }

    public string? RejectReason { get; set; }

}