namespace Backend.Models;

public class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; }
    public string UserId { get; set; }
    public DateTime ExpiryDate { get; set; } = DateTime.UtcNow.AddDays(7);
    public bool IsRevoked  { get; set; } = false; 
}