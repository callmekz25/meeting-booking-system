namespace Backend.Smtp;

public class BrevoOptions
{
    public string ApiKey { get; set; } = null!;
    public string SenderEmail { get; set; } = null!;
    public string SenderName { get; set; } = null!;
}