
using System.ComponentModel.DataAnnotations;

namespace Backend.Dtos;

public class CreateUserDto
{
    [Required]
    public string Email { get; set; }
    
    [Required]
    public string FullName { get; set; }
    
    [Required]
    public string PhoneNumber { get; set; }
    
    [Required]
    public string RoleID { get; set; }
}
