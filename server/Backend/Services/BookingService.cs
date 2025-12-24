using AutoMapper;
using Backend.Common.Models;
using Backend.Dtos;
using Backend.Helper;
using Backend.Interfaces;
using Backend.Models;
using Backend.RabbitMQ;
using Backend.Repositories;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class BookingService
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;
    private readonly UserService _userService;
    private readonly IRabbitMqPublisher _publisher;
    private readonly UserManager<User> _userManager;



    public BookingService(IUnitOfWork uow, IMapper mapper,  UserService userService, IRabbitMqPublisher publisher,  UserManager<User> userManager)
    {
       _uow = uow;
        _mapper = mapper;
        _userService = userService;
        _publisher = publisher;
        _userManager = userManager;
    }

    public async Task<ServiceResult<List<BookingDto>>> GetBookingsByRange(GetBookingsDto dto)
    {
        var result = await _userService.GetMe();
        if (!result.Success)
            return ServiceResult<List<BookingDto>>.Fail(result.Message, result.StatusCode);
        var userId = result.Data.UserID;
        var user = await _userManager.FindByIdAsync(userId);
        
        if (user == null)
            return ServiceResult<List<BookingDto>>.Fail("User not found", 401);
        var roles = await _userManager.GetRolesAsync(user);
        var isAdmin = roles.Contains("Admin");
        var start = dto.Start.Date;
        var end = dto.End.Date;
       
        var repo = _uow.GetRepository<Booking>();
      
        var query = repo.Query()
            .Where(b =>
                b.EndTime >= start &&
                b.StartTime < end &&
                b.Status != BookingStatus.Cancelled.ToString()
            );
        
        if (!isAdmin)
        {
            query = query.Where(b =>
                b.RequesterID == userId ||
                b.BookingAttendees.Any(a => a.UserID == userId)
            );
        }

        var items = await query
            .Include(b => b.Room)
            .Include(b => b.Requester)
            .Include(b => b.BookingAttendees)
            .ThenInclude(a => a.User)
            .OrderBy(b => b.StartTime)
            .ToListAsync();

        return ServiceResult<List<BookingDto>>.Ok(_mapper.Map<List<BookingDto>>(items));
    }
    private async Task<BookingValidationResult> ValidateBookingAsync(BookingCreateRequest dto, string requesterId)
    {
        var repo = _uow.GetRepository<Booking>();

        bool roomConflict = await repo.Query()
            .AnyAsync(b =>
                b.RoomID == dto.RoomID &&
                b.Status == BookingStatus.Approved.ToString() &&
                b.EndTime > dto.StartTime &&
                b.StartTime < dto.EndTime
            );

        if (roomConflict)
            return new BookingValidationResult
            {
                IsValid = false,
                RejectReason = "Room is already booked in this time range"
            };

        bool requesterConflict = await repo.Query()
            .AnyAsync(b =>
                b.Status == BookingStatus.Approved.ToString() &&
                b.EndTime > dto.StartTime &&
                b.StartTime < dto.EndTime &&
                (b.RequesterID == requesterId ||
                 b.BookingAttendees.Any(a => a.UserID == requesterId))
            );

        if (requesterConflict)
            return new BookingValidationResult
            {
                IsValid = false,
                RejectReason = "Requester has another meeting in this time range"
            };


        var attendeeIds = dto.AttendeeIDs?.Distinct().ToList() ?? new();

        bool attendeeConflict = await repo.Query()
            .AnyAsync(b =>
                b.Status == BookingStatus.Approved.ToString() &&
                b.EndTime > dto.StartTime &&
                b.StartTime < dto.EndTime &&
                (attendeeIds.Contains(b.RequesterID) ||
                 b.BookingAttendees.Any(a => attendeeIds.Contains(a.UserID)))
            );

        if (attendeeConflict)
            return new BookingValidationResult
            {
                IsValid = false,
                RejectReason = "One or more attendees have conflicting meetings"
            };

        return new BookingValidationResult { IsValid = true };
    }

    public async Task<ServiceResult<BookingDto>> CreateBooking(BookingCreateRequest dto)
    {
        var me = await _userService.GetMe();
        if (!me.Success)
            return ServiceResult<BookingDto>.Fail(me.Message, me.StatusCode);

        var userId = me.Data.UserID;

        if (dto.StartTime >= dto.EndTime)
            return ServiceResult<BookingDto>.Fail("Start time must be before end time");

        if (dto.StartTime < VnTime.Now)
            return ServiceResult<BookingDto>.Fail("Cannot create booking in the past");

        using var transaction = await _uow.BeginTransactionAsync();
        try
        {
            await _uow.ExecuteSqlRawAsync(
                "SELECT 1 FROM Rooms WHERE RoomID = {0} FOR UPDATE", 
                dto.RoomID
            );
            var validation = await ValidateBookingAsync(dto, userId);


            var booking = new Booking
            {
                RoomID = dto.RoomID,
                RequesterID = userId,
                Title = dto.Title,
                Description = dto.Description,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                DateBook = dto.DateBook,
                Status = validation.IsValid
                    ? BookingStatus.Approved.ToString()
                    : BookingStatus.Rejected.ToString(),

            };

            var repo = _uow.GetRepository<Booking>();
            await repo.AddAsync(booking);
            await _uow.SaveChangesAsync();

            
                var attendeeRepo = _uow.GetRepository<BookingAttendee>();
                var attendeeIds = dto.AttendeeIDs?.Distinct().ToList() ?? new();

                attendeeIds.Add(userId);

                foreach (var uid in attendeeIds.Distinct())
                {
                    await attendeeRepo.AddAsync(new BookingAttendee
                    {
                        BookingID = booking.BookingID,
                        UserID = uid
                    });
                }

                await _uow.SaveChangesAsync();
            

            await transaction.CommitAsync();

            var bookingFull = await repo.Query()
                .Include(b => b.Room)
                .Include(b => b.Requester)
                .Include(b => b.BookingAttendees)
                    .ThenInclude(a => a.User)
                .FirstAsync(b => b.BookingID == booking.BookingID);

            var bookingDto = _mapper.Map<BookingDto>(bookingFull);

            if (bookingDto.Status == BookingStatus.Approved)
            {
            
                await _publisher.SendMessage(
                    new EmailMessageDto
                    {
                        Booking = bookingDto
                    },
                    RabbitMqQueues.MailQueue,
                    RabbitMqExchanges.MailExChange,
                    RabbitRoutingKeys.BookingApprovedMail
                );
            
            
                await _publisher.SendMessage(
                    new EmailMessageDto
                    {
                        Booking = bookingDto
                    },
                    RabbitMqQueues.MailQueue,
                    RabbitMqExchanges.MailExChange,
                    RabbitRoutingKeys.InviteMail
                );
            }
            else
            {
            
                await _publisher.SendMessage(
                    new EmailMessageDto
                    {
                        Booking = bookingDto,
                        RejectReason = validation.RejectReason
                    },
                    RabbitMqQueues.MailQueue,
                    RabbitMqExchanges.MailExChange,
                    RabbitRoutingKeys.BookingRejectedMail
                );
            }

            return ServiceResult<BookingDto>.Ok(
                bookingDto,
                bookingDto.Status == BookingStatus.Approved
                    ? "Create booking success"
                    : "Booking created but rejected"
            );
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return ServiceResult<BookingDto>.Fail("Error creating booking: " + ex.Message);
        }
    }

    public async Task<ServiceResult<bool>> UpdateBookingStatus(int id, BookingStatus status)
    {
        var repo = _uow.GetRepository<Booking>();
        var booking = await repo.GetByIdAsync(id);
        if (booking == null)
            return ServiceResult<bool>.Fail("Booking not found");

        if (booking.Status != BookingStatus.Approved.ToString())
            return ServiceResult<bool>.Fail("Only approved bookings can be updated");

        booking.Status = status.ToString();
        await _uow.SaveChangesAsync();

        return ServiceResult<bool>.Ok(true, "Booking status updated");
    }

    private async Task<bool> HasUserConflictAsync(Booking rejected)
    {
        var repo = _uow.GetRepository<Booking>();

        var userIds = rejected.BookingAttendees
            .Select(a => a.UserID)
            .Append(rejected.RequesterID)
            .Distinct()
            .ToList();

        return await repo.Query()
            .AnyAsync(b =>
                b.Status == BookingStatus.Approved.ToString() &&
                b.BookingID != rejected.BookingID &&
                b.EndTime > rejected.StartTime &&
                b.StartTime < rejected.EndTime &&
                (
                    userIds.Contains(b.RequesterID) ||
                    b.BookingAttendees.Any(a => userIds.Contains(a.UserID))
                )
            );
    }

    public async Task<ServiceResult<bool>> CancelBookingAsync(int bookingId)
    {
        var repo = _uow.GetRepository<Booking>();
        using var transaction = await _uow.BeginTransactionAsync();

        try
        {
            

            var booking = await repo.Query()
                .Include(b => b.Room)
                .Include(b => b.Requester)
                .Include(b => b.BookingAttendees)
                    .ThenInclude(a => a.User)
                .FirstOrDefaultAsync(b => b.BookingID == bookingId);

            if (booking == null)
                return ServiceResult<bool>.Fail("Booking not found");

            if (booking.Status == BookingStatus.Cancelled.ToString())
                return ServiceResult<bool>.Fail("Booking already cancelled");

            await _uow.ExecuteSqlRawAsync(
                "SELECT 1 FROM Rooms WHERE RoomID = {0} FOR UPDATE", 
                booking.RoomID
            );

            booking.Status = BookingStatus.Cancelled.ToString();
            await _uow.SaveChangesAsync();

            var cancelledDto = _mapper.Map<BookingDto>(booking);

            await _publisher.SendMessage(
                new EmailMessageDto { Booking = cancelledDto },
                RabbitMqQueues.MailQueue,
                RabbitMqExchanges.MailExChange,
                RabbitRoutingKeys.CancelMeetingRequesterMail
            );

            await _publisher.SendMessage(
                new EmailMessageDto { Booking = cancelledDto },
                RabbitMqQueues.MailQueue,
                RabbitMqExchanges.MailExChange,
                RabbitRoutingKeys.CancelMeetingMail
            );


            var rejectedBookings = await repo.Query()
                .Where(b =>
                    b.Status == BookingStatus.Rejected.ToString() &&
                    b.EndTime > booking.StartTime &&
                    b.StartTime < booking.EndTime).OrderBy(b => booking.BookingID)
                .Include(b => b.BookingAttendees)
                .ToListAsync();

            foreach (var rejected in rejectedBookings)
            {
                if (rejected.RoomID != booking.RoomID)
                {
                    await _uow.ExecuteSqlRawAsync("SELECT 1 FROM Rooms WHERE RoomID = {0} FOR UPDATE", rejected.RoomID);
                }

                bool roomConflict = await repo.Query()
                    .AnyAsync(b =>
                        b.RoomID == rejected.RoomID &&
                        b.Status == BookingStatus.Approved.ToString() &&
                        b.EndTime > rejected.StartTime &&
                        b.StartTime < rejected.EndTime
                    );

                if (roomConflict)
                    continue;


                bool requesterConflict = await repo.Query()
                    .AnyAsync(b =>
                        b.RequesterID == rejected.RequesterID &&
                        b.Status == BookingStatus.Approved.ToString() &&
                        b.EndTime > rejected.StartTime &&
                        b.StartTime < rejected.EndTime
                    );

                if (requesterConflict)
                    continue;

                bool attendeeConflict = await HasUserConflictAsync(rejected);

                if (attendeeConflict)
                    continue;


                rejected.Status = BookingStatus.Approved.ToString();
                await _uow.SaveChangesAsync();


                var approvedFull = await repo.Query()
                    .Include(b => b.Room)
                    .Include(b => b.Requester)
                    .Include(b => b.BookingAttendees)
                        .ThenInclude(a => a.User)
                    .FirstAsync(b => b.BookingID == rejected.BookingID);

                var approvedDto = _mapper.Map<BookingDto>(approvedFull);


                await _publisher.SendMessage(
                    new EmailMessageDto { Booking = approvedDto },
                    RabbitMqQueues.MailQueue,
                    RabbitMqExchanges.MailExChange,
                    RabbitRoutingKeys.BookingApprovedMail
                );

                await _publisher.SendMessage(
                    new EmailMessageDto { Booking = approvedDto },
                    RabbitMqQueues.MailQueue,
                    RabbitMqExchanges.MailExChange,
                    RabbitRoutingKeys.InviteMail
                );
            }

            await transaction.CommitAsync();
            return ServiceResult<bool>.Ok(true, "Booking cancelled successfully");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return ServiceResult<bool>.Fail("Cancel booking failed: " + ex.Message);
        }
    }

    public async Task<ServiceResult<BookingDto>> UpdateBooking(int id, BookingCreateRequest dto)
    {
        var repo = _uow.GetRepository<Booking>();
        var attendeeRepo = _uow.GetRepository<BookingAttendee>();

        using var transaction = await _uow.BeginTransactionAsync();
        try
        {
            await _uow.ExecuteSqlRawAsync(
                "SELECT 1 FROM Rooms WHERE RoomID = {0} FOR UPDATE", 
                dto.RoomID
            );
            var booking = await repo.Query()
                .Include(b => b.BookingAttendees)
                .ThenInclude(a => a.User)
                .FirstOrDefaultAsync(b => b.BookingID == id);


            if (booking == null)
                return ServiceResult<BookingDto>.Fail("Booking not found", 404);

         
            var newStartTime = dto.StartTime;
            var newEndTime = dto.EndTime;
            var roomId = dto.RoomID;
           
            if (newStartTime >= newEndTime)
                return ServiceResult<BookingDto>.Fail("Start time must be before end time");

            if (newStartTime < VnTime.Now)
                return ServiceResult<BookingDto>.Fail("Cannot set booking in the past");

          
            
            bool isMajorChange =
                booking.StartTime != dto.StartTime ||
                booking.EndTime != dto.EndTime ||
                booking.RoomID != dto.RoomID ||
                booking.Description != dto.Description ||
                booking.Title != dto.Title;

            
            bool hasRoomConflict = await repo.Query()
                .AsNoTracking()
                .AnyAsync(b =>
                    b.BookingID != id &&
                    b.RoomID == roomId &&
                    b.Status == BookingStatus.Approved.ToString() &&
                    b.EndTime > newStartTime &&
                    b.StartTime < newEndTime
                );

          
            booking.Status = hasRoomConflict ? BookingStatus.Rejected.ToString() : BookingStatus.Approved.ToString();



            booking.Title = dto.Title;
            booking.Description = dto.Description ?? booking.Description;
            booking.StartTime = newStartTime;
            booking.EndTime = newEndTime;
            booking.DateBook = dto.DateBook;
            booking.RoomID = roomId;

            List<string> toAdd = new List<string>();
            
            if (dto.AttendeeIDs.Count > 0)
            {
                var oldAttendees = booking.BookingAttendees.Select(a => a.UserID).ToList();
                var toRemove = oldAttendees.Except(dto.AttendeeIDs).ToList();
                toAdd = dto.AttendeeIDs.Except(oldAttendees).ToList();

                foreach (var uid in toRemove)
                {
                    var att = booking.BookingAttendees.FirstOrDefault(a => a.UserID == uid);
                    if (att != null)
                        attendeeRepo.Remove(att);
                }

                foreach (var uid in toAdd.Distinct())
                {
                    await attendeeRepo.AddAsync(new BookingAttendee
                    {
                        BookingID = booking.BookingID,
                        UserID = uid
                    });
                }
                
             
            }

            
            await _uow.SaveChangesAsync();
            await transaction.CommitAsync();

       

            var updatedBooking = await repo.Query()
                .Include(b => b.Room)
                .Include(b => b.Requester)
                .Include(b => b.BookingAttendees).ThenInclude(a => a.User)
                .FirstOrDefaultAsync(b => b.BookingID == id);

            var bookingDto = _mapper.Map<BookingDto>(updatedBooking);

            var isApproved = bookingDto.Status == BookingStatus.Approved;
            
            if (isApproved)
            {
                await _publisher.SendMessage(
                    new EmailMessageDto
                    {
                        Booking = bookingDto
                    },
                    RabbitMqQueues.MailQueue,
                    RabbitMqExchanges.MailExChange,
                    RabbitRoutingKeys.BookingApprovedMail
                );
                if (toAdd.Any())
                {
                    var newAttendeesForMail = updatedBooking.BookingAttendees
                        .Where(a => toAdd.Contains(a.UserID, StringComparer.OrdinalIgnoreCase))
                        .Select(a => _mapper.Map<UserDto>(a.User))
                        .ToList();

                    
                    var bookingDtoForNewAttendees = new BookingDto
                    {
                        BookingID = bookingDto.BookingID,
                        Title = bookingDto.Title,
                        Room = bookingDto.Room,
                        Requester = bookingDto.Requester,
                        StartTime = bookingDto.StartTime,
                        EndTime = bookingDto.EndTime,
                        DateBook = bookingDto.DateBook,
                        Status = bookingDto.Status,
                        Description = bookingDto.Description,
                        Attendees = newAttendeesForMail
                    };

                    await _publisher.SendMessage(new EmailMessageDto
                        {
                            Booking =  bookingDtoForNewAttendees,
                        }, RabbitMqQueues.MailQueue,
                        RabbitMqExchanges.MailExChange, RabbitRoutingKeys.InviteMail);
                }
                
                if (isMajorChange)
                {
                    var allOtherAttendees = bookingDto.Attendees
                        .Where(a => !toAdd.Contains(a.UserID))
                        .ToList();

                    var bookingDtoForUpdate = new BookingDto
                    {
                        BookingID = bookingDto.BookingID,
                        Title = bookingDto.Title,
                        Room = bookingDto.Room,
                        Requester = bookingDto.Requester,
                        StartTime = bookingDto.StartTime,
                        EndTime = bookingDto.EndTime,
                        DateBook = bookingDto.DateBook,
                        Status = bookingDto.Status,
                        Description = bookingDto.Description,
                        Attendees = allOtherAttendees
                    };
                    await _publisher.SendMessage(
                        new EmailMessageDto { Booking = bookingDtoForUpdate },
                        RabbitMqQueues.MailQueue,
                        RabbitMqExchanges.MailExChange,
                        RabbitRoutingKeys.UpdateMeetingMail
                    );
                }
            }
            else
            {
                await _publisher.SendMessage(
                    new EmailMessageDto
                    {
                        Booking = bookingDto,
                        RejectReason = "Room is already booked in this time range"
                    },
                    RabbitMqQueues.MailQueue,
                    RabbitMqExchanges.MailExChange,
                    RabbitRoutingKeys.BookingRejectedMail
                );
            }
       

            return ServiceResult<BookingDto>.Ok(
                bookingDto, 
              "Event have been updated successfully"
            );
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return ServiceResult<BookingDto>.Fail("Error updating booking: " + ex.Message);
        }
    }



}