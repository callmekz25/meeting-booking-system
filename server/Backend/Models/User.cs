using Microsoft.AspNetCore.Identity;

namespace Backend.Models
{
    public class User : IdentityUser
    {
        public string FullName { get; set; }
        

        // Navigation Properties
        public ICollection<Booking> BookingRequests { get; set; }
        public ICollection<BookingAttendee> BookingAttendees { get; set; }
    }
}
