using BitesAndMore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BitesAndMore.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) 
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Services> Services { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<BusinessInfo> BusinessInfos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Slug)
                .IsUnique();

            // BusinessInfo is a singleton row (Id = 1); the key is assigned by the application.
            modelBuilder.Entity<BusinessInfo>()
                .Property(b => b.Id)
                .ValueGeneratedNever();
        }
    }
}
