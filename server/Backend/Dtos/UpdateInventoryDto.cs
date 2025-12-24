using Backend.Models;

namespace Backend.Dtos
{
	public class UpdateInventoryDto
	{
		public int TypeID { get; set; }
		public string SerialNumber { get; set; }
		public int Quantity { get; set; }
		public InventoryStatus Status { get; set; }

		public List<UpdateRoomEquipmentDto> RoomEquipments { get; set; }
	}
}
