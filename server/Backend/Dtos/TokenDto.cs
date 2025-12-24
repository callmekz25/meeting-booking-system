using System.ComponentModel.DataAnnotations;

namespace Backend.Dtos;

public class TokenDto
{
    [Required]
    [MinLength(1)]
    public string Token { get; set; }
}