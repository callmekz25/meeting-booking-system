using Backend.Dtos;
using CsvHelper.Configuration;

namespace Backend.Mapper;

public sealed class InventoryCsvMap : ClassMap<InventoryCsvDto>
{
    public InventoryCsvMap()
    {
        Map(m => m.TypeName).Name("TypeName");
        Map(m => m.SerialNumber).Name("SerialNumber");
        Map(m => m.Quantity).Name("Quantity");
    }
}
