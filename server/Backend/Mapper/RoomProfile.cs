namespace Backend.Mapper;

using AutoMapper;
using Backend.Models;
using Backend.Dtos;

public class RoomProfile : Profile
{
    public RoomProfile()
    {
        CreateMap<Room, RoomDto>();
    }
}
