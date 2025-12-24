using AutoMapper;
using Backend.Models;
using Backend.Dtos;


public class InventoryProfile : Profile
	{
		public InventoryProfile()
		{
			CreateMap<Inventory, GetInventoryDto>()
				.ForMember(dest => dest.Status,
					opt => opt.MapFrom(src => Enum.Parse<InventoryStatus>(src.Status)))
				.ForMember(dest => dest.RoomEquipments,
				opt => opt.MapFrom(src => src.RoomEquipments));	

			CreateMap<RoomEquipment, RoomEquipmentDto>()
				.ForMember(dest => dest.IsAvailable,
					opt => opt.MapFrom(src =>
						src.Inventory.Status != InventoryStatus.Maintenance.ToString() &&
						src.Inventory.Status != InventoryStatus.OutOfService.ToString()
					));

			CreateMap<Inventory, GetInventoryDto>()
				.ForMember(dest => dest.RoomEquipments,
					opt => opt.MapFrom(src =>
						src.RoomEquipments.Where(r => r.Quantity > 0)));



			CreateMap<CreateInventoryDto, Inventory>();
			CreateMap<CreateRoomEquipmentDto, RoomEquipment>();
			CreateMap<RoomEquipment, RoomEquipmentDto>();

	}
}
