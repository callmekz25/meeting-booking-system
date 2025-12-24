using AutoMapper;
using Backend.Common.Models;
using Backend.Dtos;
using Backend.Helper;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Backend.Services
{
	public class InventoryService
	{
		private readonly IUnitOfWork _uow;
		private readonly IMapper _mapper;

		public InventoryService(IUnitOfWork uow, IMapper mapper)
		{
			_uow = uow;
			_mapper = mapper;
		}

		public async Task<ServiceResult<List<GetInventoryDto>>> GetQuery(string? search)
		{
			try
			{
				var repo = _uow.GetRepository<Inventory>();

				var query = repo.Query().Include(i => i.EquipmentType).AsQueryable();
				if (!string.IsNullOrWhiteSpace(search))
				{
					search = search.Trim();
				
					query = query.Where(i =>
						i.SerialNumber.Contains(search) ||
						i.EquipmentType.TypeName.Contains(search)
					);
				}
  
				var data = await query
					.Select(i => new
					{
						i.InventoryID,
						i.SerialNumber,
						i.Quantity,
						i.Status,
						i.TypeID,
						i.EquipmentType,
					}).OrderByDescending(i => i.InventoryID).Take(20)
					.ToListAsync(); 

				var result = data.Select(i => new GetInventoryDto
				{
					InventoryID = i.InventoryID,
					SerialNumber = i.SerialNumber,
					Quantity = i.Quantity,
					Status = Enum.TryParse<InventoryStatus>(i.Status, true, out var s)
						? s
						: InventoryStatus.Available,
					TypeID = i.TypeID,
					TypeName = i.EquipmentType.TypeName,
				}).ToList();


				return ServiceResult<List<GetInventoryDto>>.Ok(result);
			}
			catch (Exception e)
			{
				return ServiceResult<List<GetInventoryDto>>.Fail(e.Message);
			}
		}

		public async Task<ServiceResult<StaticsInventoryDto>> GetStaticsInventory()
		{
			try
			{
				var repo = _uow.GetRepository<Inventory>();
				
				var total = await repo.Query().CountAsync();
				var totalAvailable =
					await repo.Query().Where(i => i.Status == InventoryStatus.Available.ToString()).CountAsync();
				var totalOutOfService = await  repo.Query().Where(i => i.Status == InventoryStatus.OutOfService.ToString()).CountAsync();
				var totalMaintenance = await repo.Query().Where(i => i.Status == InventoryStatus.Maintenance.ToString()).CountAsync();

				var statics = new StaticsInventoryDto
				{
					Total = total,
					TotalAvailable = totalAvailable,
					TotalOutOfService = totalOutOfService,
					TotalMaintenance = totalMaintenance,
				};
				return ServiceResult<StaticsInventoryDto>.Ok(statics);
			}
			catch (Exception e)
			{
				return ServiceResult<StaticsInventoryDto>.Fail(e.Message);
			}
		}

		public async Task<ServiceResult<PageResponse<List<GetInventoryDto>>>> GetAllAsync(int page, string? search, string? typeName, InventoryStatus? status)
		{
			const int pageSize = 15;
			if (page <= 0) page = 1;

			var repo = _uow.GetRepository<Inventory>();

			var query = repo.Query()
				.AsNoTracking()
				.Include(i => i.RoomEquipments)
				.Include(i => i.EquipmentType)
				.AsQueryable();

			// ===== SEARCH: SerialNumber =====
			if (!string.IsNullOrWhiteSpace(search))
			{
				query = query.Where(i =>
					i.SerialNumber.Contains(search));
			}

			// ===== FILTER: TypeName =====
			if (!string.IsNullOrWhiteSpace(typeName))
			{
				query = query.Where(i =>
					i.EquipmentType.TypeName == typeName);
			}

			// ===== FILTER: Status =====
			if (status.HasValue)
			{
				query = query.Where(i =>
					i.Status == status.Value.ToString());
			}

			int totalItems = await query.CountAsync();

			if (totalItems == 0)
			{
				return ServiceResult<PageResponse<List<GetInventoryDto>>>.Ok(
					new PageResponse<List<GetInventoryDto>>
					{
						Page = page,
						PageSize = pageSize,
						Total = 0,
						Items = new List<GetInventoryDto>()
					},
					"No inventories found."
				);
			}

			var inventories = await query
				.OrderByDescending(i => i.InventoryID)
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.ToListAsync();

			var data = _mapper.Map<List<GetInventoryDto>>(inventories);

			var response = new PageResponse<List<GetInventoryDto>>
			{
				Page = page,
				PageSize = pageSize,
				Total = totalItems,
				Items = data
			};

			return ServiceResult<PageResponse<List<GetInventoryDto>>>.Ok(
				response
			);
		}


		public async Task<ServiceResult<GetInventoryDto>> GetByIdAsync(int id)
		{
			var repo = _uow.GetRepository<Inventory>();

			var inventory = await repo.Query()
				.Include(i => i.RoomEquipments)
				.AsNoTracking()
				.FirstOrDefaultAsync(i => i.InventoryID == id);

			if (inventory == null)
			{
				return ServiceResult<GetInventoryDto>.Fail("Inventory not found", 404);
			}

			return ServiceResult<GetInventoryDto>.Ok(_mapper.Map<GetInventoryDto>(inventory), "Get inventory successfully");
			 
		}


		public async Task<ServiceResult<GetInventoryDto>> CreateInventoryAsync(CreateInventoryDto dto)
		{
			var inventoryRepo = _uow.GetRepository<Inventory>();
			var typeRepo = _uow.GetRepository<EquipmentType>();
			var roomRepo = _uow.GetRepository<Room>();

			// ===== VALIDATE TYPE =====
			var typeExists = await typeRepo.Query()
				.AnyAsync(t => t.TypeID == dto.TypeID);

			if (!typeExists)
				return ServiceResult<GetInventoryDto>.Fail(
					"Equipment type does not exist.", 400);

			// ===== VALIDATE SERIAL NUMBER =====
			if (string.IsNullOrWhiteSpace(dto.SerialNumber))
				return ServiceResult<GetInventoryDto>.Fail(
					"Serial number is required.", 400);

			if (!StringValidationHelper.IsValid(dto.SerialNumber))
			{
				return ServiceResult<GetInventoryDto>.Fail(
					"Serial number contains invalid characters.", 400);
			}

			var duplicate = await inventoryRepo.Query()
				.AnyAsync(i =>
					i.SerialNumber == dto.SerialNumber &&
					i.TypeID == dto.TypeID);

			if (duplicate)
			{
				return ServiceResult<GetInventoryDto>.Fail(
					"Serial number already exists.", 409);
			}

			// ===== VALIDATE QUANTITY =====
			if (dto.Quantity <= 0)
				return ServiceResult<GetInventoryDto>.Fail(
					"Inventory quantity must be greater than 0.", 400);

			if (dto.Quantity > int.MaxValue)
				return ServiceResult<GetInventoryDto>.Fail(
					"Inventory quantity exceeds allowed limit.", 400);

			// ===== VALIDATE ROOM EQUIPMENTS =====
			if (dto.RoomEquipments != null && dto.RoomEquipments.Any())
			{
				var roomIds = dto.RoomEquipments
					.Select(r => r.RoomID)
					.ToList();

				// Duplicate room
				if (roomIds.Count != roomIds.Distinct().Count())
				{
					return ServiceResult<GetInventoryDto>.Fail(
						"Duplicate RoomID found in request.", 400);
				}

				// Room exists
				var existingCount = await roomRepo.Query()
					.CountAsync(r => roomIds.Contains(r.RoomID));

				if (existingCount != roomIds.Count)
				{
					return ServiceResult<GetInventoryDto>.Fail(
						"One or more rooms do not exist.", 400);
				}

				// Quantity per room
				foreach (var r in dto.RoomEquipments)
				{
					if (r.Quantity < 0 || r.Quantity > dto.Quantity)
					{
						return ServiceResult<GetInventoryDto>.Fail(
							"Invalid room equipment quantity.", 400);
					}
				}

				// Total assigned
				var totalAssigned = dto.RoomEquipments.Sum(r => r.Quantity);

				if (totalAssigned > dto.Quantity)
				{
					return ServiceResult<GetInventoryDto>.Fail(
						"Total assigned quantity exceeds inventory quantity.", 400);
				}
			}

			// ===== CREATE INVENTORY =====
			var inventory = _mapper.Map<Inventory>(dto);
			inventory.SerialNumber = dto.SerialNumber.Trim();
			inventory.Status = InventoryStatus.Available.ToString();

			if (dto.RoomEquipments != null && dto.RoomEquipments.Any())
			{
				inventory.RoomEquipments = dto.RoomEquipments.Select(r => new RoomEquipment
				{
					RoomID = r.RoomID,
					Quantity = r.Quantity
				}).ToList();
			}

			await inventoryRepo.AddAsync(inventory);
			await _uow.SaveChangesAsync();

			return ServiceResult<GetInventoryDto>.Ok(
				_mapper.Map<GetInventoryDto>(inventory),
				"Inventory created successfully.");
		}




		public async Task<ServiceResult<GetInventoryDto>> UpdateInventoryAsync(int inventoryId, UpdateInventoryDto dto)
		{
			var inventoryRepo = _uow.GetRepository<Inventory>();
			var roomRepo = _uow.GetRepository<Room>();
			var typeRepo = _uow.GetRepository<EquipmentType>();

			var inventory = await inventoryRepo.Query()
				.Include(i => i.RoomEquipments)
				.FirstOrDefaultAsync(i => i.InventoryID == inventoryId);

			if (inventory == null)
				return ServiceResult<GetInventoryDto>.Fail("Inventory not found.", 404);

			// ===== VALIDATE TYPE =====
			var typeExists = await typeRepo.Query()
				.AnyAsync(t => t.TypeID == dto.TypeID);

			if (!typeExists)
				return ServiceResult<GetInventoryDto>.Fail("Equipment type does not exist.", 400);

			// ===== VALIDATE SERIAL NUMBER =====
			if (string.IsNullOrWhiteSpace(dto.SerialNumber))
				return ServiceResult<GetInventoryDto>.Fail("Serial number is required.", 400);

			if (!StringValidationHelper.IsValid(dto.SerialNumber))
			{
				return ServiceResult<GetInventoryDto>.Fail(
					"Serial number contains invalid characters.", 400);
			}

			var duplicate = await inventoryRepo.Query()
												.AnyAsync(i =>
													i.InventoryID != inventoryId &&
													i.SerialNumber == dto.SerialNumber &&
													i.TypeID == dto.TypeID
												);

			if (duplicate)
				return ServiceResult<GetInventoryDto>.Fail(
					"Serial number already exists.", 400);

			// ===== VALIDATE QUANTITY =====
			if (dto.Quantity <= 0)
				return ServiceResult<GetInventoryDto>.Fail(
					"Inventory quantity must be greater than 0.", 400);

			if (dto.Quantity > int.MaxValue)
				return ServiceResult<GetInventoryDto>.Fail(
					"Inventory quantity exceeds allowed limit.", 400);

			// ===== VALIDATE ROOM EQUIPMENTS =====
			if (dto.RoomEquipments != null && dto.RoomEquipments.Any())
			{
				var roomIds = dto.RoomEquipments.Select(r => r.RoomID).ToList();

				// Duplicate room
				if (roomIds.Count != roomIds.Distinct().Count())
				{
					return ServiceResult<GetInventoryDto>.Fail(
						"Duplicate RoomID found in request.", 400);
				}

				// Room exists
				var existingCount = await roomRepo.Query()
					.CountAsync(r => roomIds.Contains(r.RoomID));

				if (existingCount != roomIds.Count)
				{
					return ServiceResult<GetInventoryDto>.Fail(
						"One or more rooms do not exist.", 400);
				}
			}

			// ===== UPDATE BASIC FIELDS =====
			inventory.TypeID = dto.TypeID;
			inventory.SerialNumber = dto.SerialNumber.Trim();
			inventory.Quantity = dto.Quantity;
			inventory.Status = dto.Status.ToString();

			// ===== STATUS: OUT OF SERVICE =====
			if (dto.Status == InventoryStatus.OutOfService)
			{
				foreach (var re in inventory.RoomEquipments)
				{
					re.Quantity = 0;
				}
			}
			else
			{
				var incomingRoomIds = dto.RoomEquipments?
					.Select(r => r.RoomID)
					.ToHashSet() ?? new HashSet<int>();

				// Remove assignment (set quantity = 0)
				foreach (var existing in inventory.RoomEquipments)
				{
					if (!incomingRoomIds.Contains(existing.RoomID))
					{
						existing.Quantity = 0;
					}
				}

				// Update room equipments
				foreach (var dtoRoom in dto.RoomEquipments)
				{
					if (dtoRoom.Quantity < 0 || dtoRoom.Quantity > dto.Quantity)
					{
						return ServiceResult<GetInventoryDto>.Fail(
							"Invalid room equipment quantity.", 400);
					}

					var existing = inventory.RoomEquipments
						.FirstOrDefault(r => r.RoomID == dtoRoom.RoomID);

					if (existing != null)
					{
						existing.Quantity = dtoRoom.Quantity;
					}
					else
					{
						inventory.RoomEquipments.Add(new RoomEquipment
						{
							RoomID = dtoRoom.RoomID,
							Quantity = dtoRoom.Quantity
						});
					}
				}

				// Validate total quantity
				int totalAssigned = inventory.RoomEquipments.Sum(r => r.Quantity);

				if (totalAssigned > inventory.Quantity)
				{
					return ServiceResult<GetInventoryDto>.Fail(
						"Total assigned quantity exceeds inventory quantity.", 400);
				}
			}

			await _uow.SaveChangesAsync();

			// Reload for response
			var updated = await inventoryRepo.Query()
				.Include(i => i.RoomEquipments)
				.AsNoTracking()
				.FirstAsync(i => i.InventoryID == inventoryId);

			return ServiceResult<GetInventoryDto>.Ok(
				_mapper.Map<GetInventoryDto>(updated),
				"Inventory updated successfully.");
		}




	}
}
