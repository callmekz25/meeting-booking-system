namespace Backend.Mapper;

using AutoMapper;
using Backend.Models;
using Backend.Dtos;

public class BookingProfile : Profile
{
    public BookingProfile()
    {
        CreateMap<Booking, BookingDto>()
            .ForMember(dest => dest.Status,
                opt => opt.MapFrom(src => Enum.Parse<BookingStatus>(src.Status)))
            .ForMember(dest => dest.Attendees,
                opt => opt.MapFrom(src => src.BookingAttendees.Select(a => a.User)));
    }
}
