namespace Backend.Common.Models;

public class ServiceResult<T>
{
    public bool Success { get; set; }
    public int StatusCode  { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
    
    public static ServiceResult<T> Ok(T data, string message = "")
        => new() { Success = true, Data = data, Message = message, StatusCode = 200};

    public static ServiceResult<T> Fail(string message, int statusCode = 400)
        => new() { Success = false, Message = message, StatusCode = statusCode };
}