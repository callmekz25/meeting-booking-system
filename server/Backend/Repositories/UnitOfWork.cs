using Backend.Data;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Backend.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    
    private IDbContextTransaction? _transaction; 
    
    private readonly Dictionary<Type, object> _repositories = new ();
 
    public UnitOfWork(AppDbContext context)
    {
        _context = context;
     
    }

    public IGenericRepository<T> GetRepository<T>() where T : class
    {
        var type = typeof(T);

        if (_repositories.TryGetValue(type, out var existingRepo))
        {
            return (IGenericRepository<T>)existingRepo;
        }

        var repository = new GenericRepository<T>(_context);
        _repositories.Add(type, repository);

        return repository;
    }

    public async Task ExecuteSqlRawAsync(string sql, params object[] parameters)
    {
        await _context.Database.ExecuteSqlRawAsync(sql, parameters);
    }
    public async Task<IDbContextTransaction> BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
        return _transaction;
    }

    public async Task CommitAsync()
    {
        if (_transaction == null)
            throw new InvalidOperationException("No active transaction to commit.");
      
        await _transaction.CommitAsync();
       
        await DisposeTransactionAsync();
    }

    public async Task RollbackAsync()
    {
        if (_transaction == null) 
            throw new InvalidOperationException("No active transaction to rollback.");
      
        await _transaction.RollbackAsync();
       
        await DisposeTransactionAsync();
    }

    public async Task DisposeTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
    
    public void Dispose()
    {
        _context.Dispose();
    }
}

