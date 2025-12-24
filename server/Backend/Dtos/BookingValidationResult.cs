namespace Backend.Dtos
{
    public class BookingValidationResult
    {
        public bool IsValid { get; set; }
        public string? RejectReason { get; set; }

    }
}
