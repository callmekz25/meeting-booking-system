namespace Backend.Dtos
{
    public class PasswordChangedEmail
    {
        public string UserId { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public DateTime ChangedAt { get; set; }
    }
}
