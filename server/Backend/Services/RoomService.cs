using System.Collections;
using System.Security.Claims;
using Backend.Common.Models;
using Backend.Dtos;
using Backend.Interfaces;
using Backend.Models;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class RoomService 
{
   
    private IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContext;
    public RoomService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContext)
    {
        _unitOfWork = unitOfWork;
        _httpContext = httpContext;
    }

    public async Task<ServiceResult<List<RoomDto>>> GetRoomsByDateTime(DateTime startDate, DateTime endDate)
    {
        var roomRepo = _unitOfWork.GetRepository<Room>();
        var bookingRepo = _unitOfWork.GetRepository<Booking>();

        
        var rooms = await roomRepo.Query()
            .Include(r => r.RoomEquipments)
            .ThenInclude(re => re.Inventory)
            .ThenInclude(i => i.EquipmentType)
            .ToListAsync();

      
        var bookings = await bookingRepo.Query()
            .Where(b => b.Status == BookingStatus.Approved.ToString() &&
                        b.StartTime < endDate &&
                        b.EndTime > startDate) 
            .ToListAsync();

    
        var roomDtos = rooms.Select(r => new RoomDto
        {
            RoomID = r.RoomID,
            Name = r.Name,
            Code = r.Code,
            Capacity = r.Capacity,
            IsInUse = bookings.Any(b => b.RoomID == r.RoomID) ,
            IsAvailable = r.IsAvailable,
            RoomEquipments = r.RoomEquipments.Select((re) => new RoomEquipmentDefaultDto
            {
                InventoryID = re.InventoryID,
                TypeName = re.Inventory.EquipmentType.TypeName,
                TypeID = re.Inventory.EquipmentType.TypeID,
                SerialNumber = re.Inventory.SerialNumber,
                InventoryQuantity = re.Inventory.Quantity,
                AssignQuantity = re.Quantity,
                Status = re.Inventory.Status,
            }).ToList(),
        }).ToList();

        return ServiceResult<List<RoomDto>>.Ok(roomDtos);
    }
    public async Task<ServiceResult<List<RoomDto>>> GetAllRooms()
    {
        var roomRepo = _unitOfWork.GetRepository<Room>();

        
        var rooms = await roomRepo.Query().OrderBy(r => r.IsAvailable).ToListAsync();
        
        var roomDtos = rooms.Select(r => new RoomDto
        {
            RoomID = r.RoomID,
            Name = r.Name,
            Code = r.Code,
            Capacity = r.Capacity,
            IsInUse = false,
            IsAvailable = r.IsAvailable,
        }).ToList();

        return ServiceResult<List<RoomDto>>.Ok(roomDtos);
    }

    public async Task<ServiceResult<PageResponse<List<RoomDto>>>> GetRoomsPagination(int Page, string? Name)
    {
        try
        {
            int pageSize = 6;
            int page = Page <= 0 ? 1 : Page;
            var query =  _unitOfWork.GetRepository<Room>().Query();
            
            
            if (!string.IsNullOrWhiteSpace(Name))
            {
                query = query.Where(r => r.Name.Contains(Name));
            }
            int total = await query.CountAsync();
            var rooms = await query
                .OrderByDescending(r => r.RoomID)
                .Skip((page - 1) * pageSize) 
                .Take(pageSize)
                .Select(room => new RoomDto
                {
                    RoomID = room.RoomID,
                    Name = room.Name,
                    Code = room.Code,
                    Capacity = room.Capacity,
                    IsAvailable = room.IsAvailable,

                    RoomEquipments = room.RoomEquipments.Select(re => new RoomEquipmentDefaultDto
                    {
                        InventoryID = re.InventoryID,
                        TypeName = re.Inventory.EquipmentType.TypeName,
                        TypeID = re.Inventory.EquipmentType.TypeID,
                        SerialNumber = re.Inventory.SerialNumber,
                        InventoryQuantity = re.Inventory.Quantity,
                        AssignQuantity = re.Quantity,
                        Status = re.Inventory.Status,
                    }).ToList()
                })
                .ToListAsync();

            var response = new PageResponse<List<RoomDto>>
            {
                Items = rooms,
                Page = page,
                PageSize = pageSize,
                Total = total
            };
            return ServiceResult<PageResponse<List<RoomDto>>>.Ok(response);
        }
        catch (Exception e)
        {
            return ServiceResult<PageResponse<List<RoomDto>>>.Fail(e.Message);
        }

    }

    public async Task<ServiceResult<CreateUpdateRoomResponse>> CreateRoom(CreateRoomDto dto)
    {
        var email = _httpContext.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);
        var repo = _unitOfWork.GetRepository<Room>();
        var inventoryRepo = _unitOfWork.GetRepository<Inventory>();
       
        await using var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var existingRoom = await repo.Query()
                .AnyAsync(r => r.Code == dto.Code);
            
            if (existingRoom)
            {
                return ServiceResult<CreateUpdateRoomResponse>.Fail(
                    $"Room code already exists", 400
                );
            }
            var inventoryIds = dto.AssignEquipments
                .Select(x => x.InventoryID)
                .Distinct()
                .ToList();

            var inventories = await inventoryRepo
                .Query()
                .Where(i => inventoryIds.Contains(i.InventoryID))
                .ToListAsync();
            
            foreach (var assign in dto.AssignEquipments)
            {
                var inventory = inventories.FirstOrDefault(i => i.InventoryID == assign.InventoryID);

                if (inventory == null)
                    return ServiceResult<CreateUpdateRoomResponse>.Fail("Inventory not found", 404);
                
                inventory.Quantity -= assign.Quantity;

                if (inventory.Quantity < 0)
                    return ServiceResult<CreateUpdateRoomResponse>.Fail(
                        $"'{inventory.SerialNumber}' not enough in stock"
                    );
            }

            var room = new Room
            {
                Capacity = dto.Capacity,
                Code = dto.Code,
                Name = dto.Name,
                IsAvailable = true,
                Email = email,
                RoomEquipments = dto.AssignEquipments.Select(eq => new RoomEquipment
                {
                    InventoryID = eq.InventoryID,
                    Quantity = eq.Quantity
                }).ToList()
            };

          
            await repo.AddAsync(room);

            await _unitOfWork.SaveChangesAsync();
            
            await transaction.CommitAsync();
            
            var result = new CreateUpdateRoomResponse()
            {
                RoomID = room.RoomID,
                Name = room.Name,
                Code = room.Code,
                Capacity = room.Capacity,
                IsAvailable = room.IsAvailable,
                RoomEquipments = room.RoomEquipments.Select(re => new RoomEquipmentDto
                {
                    Quantity = re.Quantity,
                    RoomEquipmentID = re.RoomEquipmentID,
                    RoomID = re.RoomID,
                }).ToList(),
            };

            return ServiceResult<CreateUpdateRoomResponse>.Ok(result, "Created room successful");

        }
        catch (Exception e)
        {
            await transaction.RollbackAsync();
            return ServiceResult<CreateUpdateRoomResponse>.Fail(
                e.InnerException?.Message ?? e.Message
            );
        }
    }
    
    public async Task<ServiceResult<CreateUpdateRoomResponse>> UpdateRoom(int RoomID, UpdateRoomDto dto)
{
    var repo = _unitOfWork.GetRepository<Room>();
    var inventoryRepo = _unitOfWork.GetRepository<Inventory>();
    var roomEquipmentRepo = _unitOfWork.GetRepository<RoomEquipment>();

    await using var transaction = await _unitOfWork.BeginTransactionAsync();
    try
    {
        var existingRoom = await repo.Query()
            .AnyAsync(r => r.Code == dto.Code);
            
        if (existingRoom)
        {
            return ServiceResult<CreateUpdateRoomResponse>.Fail(
                $"Room code already exists", 400
            );
        }
        var room = await repo
            .Query()
            .Include(r => r.RoomEquipments)
            .FirstOrDefaultAsync(r => r.RoomID == RoomID);

        if (room == null)
            return ServiceResult<CreateUpdateRoomResponse>.Fail("Room not found", 404);

        
        foreach (var re in room.RoomEquipments)
        {
            var inventory = await inventoryRepo
                .Query()
                .FirstOrDefaultAsync(i => i.InventoryID == re.InventoryID);

            if (inventory != null)
            {
                inventory.Quantity += re.Quantity;
            }
        }
     
     
        roomEquipmentRepo.RemoveRange(room.RoomEquipments);

       
        var inventoryIds = dto.AssignEquipments
            .Select(x => x.InventoryID)
            .Distinct()
            .ToList();

        var inventories = await inventoryRepo
            .Query()
            .Where(i => inventoryIds.Contains(i.InventoryID))
            .ToListAsync();

        foreach (var assign in dto.AssignEquipments)
        {
            var inventory = inventories.FirstOrDefault(i => i.InventoryID == assign.InventoryID);

            if (inventory == null)
                return ServiceResult<CreateUpdateRoomResponse>.Fail("Inventory not found", 404);

            inventory.Quantity -= assign.Quantity;

            if (inventory.Quantity < 0)
                return ServiceResult<CreateUpdateRoomResponse>.Fail(
                    $"'{inventory.SerialNumber}' not enough in stock"
                );
        }

     
        room.Name = dto.Name;
        room.Code = dto.Code;
        room.Capacity = dto.Capacity;
        room.IsAvailable = dto.IsAvailable;

      
        room.RoomEquipments = dto.AssignEquipments.Select(eq => new RoomEquipment
        {
            InventoryID = eq.InventoryID,
            Quantity = eq.Quantity
        }).ToList();

        await _unitOfWork.SaveChangesAsync();
        await transaction.CommitAsync();

        
        var result = new CreateUpdateRoomResponse
        {
            RoomID = RoomID,
            Name = room.Name,
            Code = room.Code,
            Capacity = room.Capacity,
            IsAvailable = room.IsAvailable,
            RoomEquipments = room.RoomEquipments.Select(re => new RoomEquipmentDto
            {
                RoomEquipmentID = re.RoomEquipmentID,
                RoomID = re.RoomID,
                Quantity = re.Quantity
            }).ToList()
        };

        return ServiceResult<CreateUpdateRoomResponse>.Ok(result, "Updated room successfully");
    }
    catch (Exception e)
    {
        await transaction.RollbackAsync();
        return ServiceResult<CreateUpdateRoomResponse>.Fail(
            e.InnerException?.Message ?? e.Message
        );
    }
}


}