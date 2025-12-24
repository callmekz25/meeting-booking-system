using Backend.Models;

namespace Backend.Dtos
{
	public class CreateInventoryDto
	{
		public int TypeID { get; set; }
		public string SerialNumber { get; set; }
		public int Quantity { get; set; }
		public List<CreateRoomEquipmentDto> RoomEquipments { get; set; }
	}
}
