using Backend.Common.Models;
using Backend.Dtos;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class DashboardService
{
    private readonly IUnitOfWork _unitOfWork;
    
    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<DashboardDto>> GetDashboardStatics()
    {
        var inventoryRepo = _unitOfWork.GetRepository<Inventory>();
        var roomRepo = _unitOfWork.GetRepository<Room>();
        try
        {


            var totalRooms = await roomRepo.Query().CountAsync();
            var totalEquipments = await inventoryRepo.Query().CountAsync();
            var totalAvailableInventory = await inventoryRepo.Query()
                .Where(i => i.Status == InventoryStatus.Available.ToString()).CountAsync();
            var totalMaintenanceInventory = await inventoryRepo.Query()
                .Where(i => i.Status == InventoryStatus.Maintenance.ToString()).CountAsync();
            var totalOutOfServiceInventory = await inventoryRepo.Query()
                .Where(i => i.Status == InventoryStatus.OutOfService.ToString()).CountAsync();


            var totalAvailableRoom = await roomRepo.Query()
                .CountAsync(r => r.IsAvailable);

            var totalUnavailableRoom = await roomRepo.Query()
                .CountAsync(r => !r.IsAvailable);
            
         

            var equipmentUsage = await inventoryRepo.Query()
                .Include(i => i.RoomEquipments)
                .Include(i => i.EquipmentType)
                .Select(i => new EquipmentUsageDto
            {
                Usage = i.RoomEquipments.Sum(re => re.Quantity),
                InventoryID = i.InventoryID,
                TypeName = i.EquipmentType.TypeName,
                TypeID =  i.EquipmentType.TypeID,
                SerialNumber = i.SerialNumber
                
            }).ToListAsync();

            var roomUsageQuery = roomRepo.Query()
                .Select(r => new RoomUsageDto
                {
                    RoomID = r.RoomID,
                    Name = r.Name,
                    Usage = r.Bookings.Count()
                });
            
            var roomUsage = await roomUsageQuery.ToListAsync();
            
            var topUsageRooms = await roomUsageQuery
                .OrderByDescending(r => r.Usage)
                .Take(3)
                .ToListAsync();

            var underUsageRooms = await roomUsageQuery
                .OrderBy(r => r.Usage)
                .Take(3)
                .ToListAsync();


            var result = new DashboardDto
            {
                AvailableInventory = totalAvailableInventory,
                AvailableRooms = totalAvailableRoom,
                UnavailableRooms =  totalUnavailableRoom,
                MaintenanceInventory = totalMaintenanceInventory,
                OutOfServiceInventory = totalOutOfServiceInventory,
                TotalInventory = totalEquipments,
                TopUsageRooms = topUsageRooms,
                UnderUsageRooms =  underUsageRooms,
                TotalRooms = totalRooms,
                EquipmentUsage = equipmentUsage,
                RoomsUsage = roomUsage,
            };
            return ServiceResult<DashboardDto>.Ok(result);
        }
        catch (Exception e)
        {
            return  ServiceResult<DashboardDto>.Fail(e.Message);
        }
    }
}