using AutoMapper;
using Backend.Dtos;
using Backend.Models;

namespace Backend.Mapper;

public class EquipmentTypeProfile : Profile
{
    public EquipmentTypeProfile()
    {
        CreateMap<EquipmentType, EquipmentTypeDto>();
    }
}