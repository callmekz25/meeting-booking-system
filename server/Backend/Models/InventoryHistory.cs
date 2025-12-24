namespace Backend.Models
{
    public enum Status
    {
        InUse, Maintenance, OutOfService
    }
    public class InventoryHistory
    {
        public Guid Id { get; set; }
        public int InventoryID { get; set; }
        public string Status { get; set; }  // InUse, Maintenance, OutOfService
        public string Description { get; set; }
        public DateTime RevisionDate { get; set; }

        // Navigation
        public Inventory Inventory { get; set; }
    }
}
