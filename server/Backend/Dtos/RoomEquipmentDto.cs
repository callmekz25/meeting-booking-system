
namespace Backend.Dtos
{
	public class RoomEquipmentDto
	{
		public int RoomEquipmentID { get; set; }
		public int RoomID { get; set; }
		public int Quantity { get; set; }
		public bool IsAvailable { get; set; }
	}
}

