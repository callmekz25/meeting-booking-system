using AutoMapper;
using Backend.Common.Models;
using Backend.Dtos;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class EquipmentTypeService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    
    public EquipmentTypeService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ServiceResult<List<EquipmentTypeDto>>> GetEquipmentType()
    {
        try
        {
            var eqt = await _unitOfWork.GetRepository<EquipmentType>().Query().ToListAsync();
            
            return ServiceResult<List<EquipmentTypeDto>>.Ok(_mapper.Map<List<EquipmentTypeDto>>(eqt));
        }
        catch (Exception e)
        {
            return ServiceResult<List<EquipmentTypeDto>>.Fail(e.Message);
        }
    }
}