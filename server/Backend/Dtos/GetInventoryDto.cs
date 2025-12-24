using Backend.Models;

namespace Backend.Dtos
{
	public class GetInventoryDto
	{
		public int InventoryID { get; set; }
		public int TypeID { get; set; }
		public string SerialNumber { get; set; }
		public InventoryStatus Status { get; set; }
		public int Quantity { get; set; }
		public string TypeName { get; set; }
		public List<RoomEquipmentDto> RoomEquipments { get; set; }
	}
}
