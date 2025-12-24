
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class PasswordResetToken
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Token { get; set; }
        public DateTime ExpireAt { get; set; } = DateTime.UtcNow;
        public bool IsUsed { get; set; } = false;
        public string RequestIP { get; set; }
        public DateTime CreatedAt { get; set; }


    }
}
