using Microsoft.EntityFrameworkCore.Storage;

namespace Backend.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<T> GetRepository<T>() where T : class;
    Task<IDbContextTransaction> BeginTransactionAsync();
    Task ExecuteSqlRawAsync(string sql, params object[] parameters);
    Task CommitAsync();
    Task DisposeTransactionAsync();
    Task<int> SaveChangesAsync();
}   