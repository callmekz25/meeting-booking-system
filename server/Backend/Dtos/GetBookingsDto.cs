using System.ComponentModel.DataAnnotations;

namespace Backend.Dtos;

public class GetBookingsDto
{
    [Required]
    public DateTime Start { get; set; }
    [Required]
    public DateTime End { get; set; }
 
}