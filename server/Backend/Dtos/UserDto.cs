namespace Backend.Dtos;

public class UserDto
{
    public string UserID { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Role { get; set; }
    public string? RoleID { get; set; }
    public bool IsAvailable { get; set; }
}