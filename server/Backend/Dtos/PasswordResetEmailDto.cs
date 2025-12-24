namespace Backend.Dtos;

public class PasswordResetEmailDto
{
    public string Email { get; set; }
    public string UserName { get; set; }
    public string ResetLink { get; set; }
}