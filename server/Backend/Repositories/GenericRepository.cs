using Backend.Data;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    protected readonly AppDbContext _db;
    private DbSet<T> dbSet;

    public GenericRepository(AppDbContext db)
    {
        _db = db;
        dbSet = _db.Set<T>();
    }

    public IQueryable<T> Query()
    {
        return dbSet.AsQueryable();
    }

    public async Task<T?> GetByIdAsync(object id)
    {
        return await dbSet.FindAsync(id);
    }

    public async Task<T> AddAsync(T entity)
    {
        await dbSet.AddAsync(entity);
        return entity;
    }

    public async Task AddRangeAsync(IEnumerable<T> entities)
    {
       await dbSet.AddRangeAsync(entities);
    }

    public void Update(T entity)
    {
        dbSet.Update(entity);
    }

    public void Remove(T entity)
    {
        dbSet.Remove(entity);
    }

    public void RemoveRange(IEnumerable<T> entities)
    {
        dbSet.RemoveRange(entities);
    }

   
}
