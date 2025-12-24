namespace Backend.Dtos
{
    public class BookingCreateRequest
    {
        public int RoomID { get; set; }
        public string Title { get; set; }
        public DateTime DateBook { get; set; }
        public string? Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public List<string> AttendeeIDs { get; set; } = new();


    }
}
