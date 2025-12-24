namespace Backend.Dtos;

public class QueryParameters
{
    private int _pageSize = 10;

    public int Page { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > 50) ? 50 : value; 
    }

    public string? Search { get; set; }
    public string? Sort { get; set; }
    public string Order { get; set; } = "asc";
}