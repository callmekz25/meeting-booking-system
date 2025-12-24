using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Backend.Common.Models;
using Backend.Dtos;
using Backend.Interfaces;
using Backend.Mapper;
using Backend.Models;
using Backend.RabbitMQ;
using CsvHelper;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class UploadFileService
{

    
    private readonly IRabbitMqPublisher _publisher;
    private readonly IUnitOfWork _uow;

    public UploadFileService(IRabbitMqPublisher publisher,  IUnitOfWork uow)
    {
        _publisher = publisher;
        _uow = uow;
    }

    public async Task<ServiceResult<ExtractFileResponseDto>> ExtractFile(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return ServiceResult<ExtractFileResponseDto>.Fail("File is null or empty");


            if (!file.FileName.EndsWith(".csv"))
                return ServiceResult<ExtractFileResponseDto>.Fail("Invalid file format");


            var filePath = await SaveTempFileAsync(file);

            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            csv.Context.RegisterClassMap<InventoryCsvMap>();

            var records = csv.GetRecords<InventoryCsvDto>().ToList();

            if (!records.Any())
                return ServiceResult<ExtractFileResponseDto>.Fail("File don't have any data");

            var response = new ExtractFileResponseDto
            {
                FilePath = filePath,
                InventoryCsvDto = records
            };
           
            return ServiceResult<ExtractFileResponseDto>.Ok(response);
        }
        catch (Exception e)
        {
            return ServiceResult<ExtractFileResponseDto>.Fail("Invalid file or format");
        }
       
    }

    public async Task<ServiceResult<bool>> HandleInsertData(List<InventoryCsvDto> list, string filePath)
    {
        try
        {
            var invalidItems = list
                .Where(x => x.Quantity < 0)
                .ToList();

            if (invalidItems.Any())
            {
                return ServiceResult<bool>.Fail(
                    "Quantity must be greater than or equal to 0");
            }
            var inventoryRepo = _uow.GetRepository<Inventory>();
            var eqtRepo = _uow.GetRepository<EquipmentType>();

           
            var equipmentTypes = await eqtRepo.Query().ToListAsync();

            var eqtDict = equipmentTypes
                .ToDictionary(e => e.TypeName.ToLower(), e => e);

            foreach (var item in list)
            {
                var serial = item.SerialNumber.ToLower();
                var typeName = item.TypeName.ToLower();

           
                if (!eqtDict.TryGetValue(typeName, out var equipmentType))
                {
                    equipmentType = new EquipmentType
                    {
                        TypeName = item.TypeName
                    };

                    await eqtRepo.AddAsync(equipmentType);
                    
                    eqtDict[typeName] = equipmentType;
                }

               
                var existInventory = await inventoryRepo.Query()
                    .Where(i =>
                        i.SerialNumber.ToLower() == serial &&
                        i.TypeID == equipmentType.TypeID
                    )
                    .FirstOrDefaultAsync();

                if (existInventory != null)
                {
                    existInventory.Quantity += item.Quantity;
                }
                else
                {
                    await inventoryRepo.AddAsync(new Inventory
                    {
                        SerialNumber = item.SerialNumber,
                        Quantity = item.Quantity,
                        Status = InventoryStatus.Available.ToString(),
                        EquipmentType = equipmentType,
                    });
                }
            }

           
            await _uow.SaveChangesAsync();
            
            await _publisher.SendMessage(new UploadFileDto
                {
                    FilePath = filePath
                },
                RabbitMqQueues.UploadFileQueue, 
                RabbitMqExchanges.UploadFileExChange,
                RabbitRoutingKeys.UploadFileCsv);

            return ServiceResult<bool>.Ok(true, "Upload data successful");
        }
        catch (Exception e)
        {
            return ServiceResult<bool>.Fail(e?.InnerException?.Message ?? e.Message);
        }
    }

    
    private async Task<string> SaveTempFileAsync(IFormFile file)
    {
        var folder = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "csv");

        if (!Directory.Exists(folder))
            Directory.CreateDirectory(folder);

        var filePath = Path.Combine(
            folder,
            $"{Guid.NewGuid()}_{file.FileName}"
        );

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return filePath;
    }

    public async Task<ServiceResult<ExtractFileResponseDto>> ExtractCsv(
    UploadFileDto dto)
    {
        if (!File.Exists(dto.FilePath))
            return ServiceResult<ExtractFileResponseDto>.Fail("File not found");

        var lines = await File.ReadAllLinesAsync(dto.FilePath);

        if (lines.Length <= 1)
            return ServiceResult<ExtractFileResponseDto>.Fail("CSV file empty");

        var response = new ExtractFileResponseDto
        {
            FilePath = dto.FilePath,
            InventoryCsvDto = new List<InventoryCsvDto>()
        };

        foreach (var line in lines.Skip(1)) // bỏ header
        {
            if (string.IsNullOrWhiteSpace(line))
                continue;

            var cols = line.Split(',');

            if (cols.Length < 3)
                continue;

            response.InventoryCsvDto.Add(new InventoryCsvDto
            {
                TypeName = cols[0].Trim(),
                SerialNumber = cols[1].Trim(),
                Quantity = int.Parse(cols[2].Trim())
            });
        }

        return ServiceResult<ExtractFileResponseDto>.Ok(response);
    }


}