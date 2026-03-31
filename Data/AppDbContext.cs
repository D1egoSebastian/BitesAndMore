using BitesAndMore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BitesAndMore.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) 
            : base(options) { }

        public DbSet<User> Users { get; set; }
    }
}
