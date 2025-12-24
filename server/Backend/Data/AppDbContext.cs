using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Room> Rooms { get; set; }
        public DbSet<EquipmentType> EquipmentTypes { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<InventoryHistory> InventoryHistories { get; set; }
        public DbSet<RoomEquipment> RoomEquipments { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingAttendee> BookingAttendees { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }



        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Bắt buộc gọi base
            base.OnModelCreating(builder);

            // Seed role
            builder.Entity<IdentityRole>().HasData(
                new IdentityRole { Name = "Admin", NormalizedName = "ADMIN" },
                new IdentityRole { Name = "NormalUser", NormalizedName = "NORMALUSER" }
            );
            
            builder.Entity<EquipmentType>()
                .HasKey(e => e.TypeID);


            // Các quan hệ
            builder.Entity<Inventory>()
                .HasOne(i => i.EquipmentType)
                .WithMany(t => t.Inventories)
                .HasForeignKey(i => i.TypeID);

            builder.Entity<InventoryHistory>()
                .HasOne(h => h.Inventory)
                .WithMany(i => i.InventoryHistories)
                .HasForeignKey(h => h.InventoryID);

            builder.Entity<RoomEquipment>()
                .HasOne(re => re.Room)
                .WithMany(r => r.RoomEquipments)
                .HasForeignKey(re => re.RoomID);

            builder.Entity<RoomEquipment>()
                .HasOne(re => re.Inventory)
                .WithMany(i => i.RoomEquipments)
                .HasForeignKey(re => re.InventoryID);

            builder.Entity<Booking>()
                .HasOne(b => b.Room)
                .WithMany(r => r.Bookings)
                .HasForeignKey(b => b.RoomID);

            builder.Entity<Booking>()
                .HasOne(b => b.Requester)
                .WithMany(u => u.BookingRequests)
                .HasForeignKey(b => b.RequesterID);

            builder.Entity<BookingAttendee>()
                .HasOne(ba => ba.Booking)
                .WithMany(b => b.BookingAttendees)
                .HasForeignKey(ba => ba.BookingID);

            builder.Entity<BookingAttendee>()
                .HasOne(ba => ba.User)
                .WithMany(u => u.BookingAttendees)
                .HasForeignKey(ba => ba.UserID);

            builder.Entity<BookingAttendee>()
                .HasIndex(x => new { x.BookingID, x.UserID })
                .IsUnique();

            
        }
    }
    
    
}