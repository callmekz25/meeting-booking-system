namespace Backend.Dtos;

public class PageResponse<T>
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int Total { get; set; }
    public T Items { get; set; }
}