using BitesAndMore.API.Data;
using BitesAndMore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BitesAndMore.API.Helpers
{
    public static class AdminSeeder
    {
        /// <summary>
        /// Creates the single admin user from the Admin:Email, Admin:Name and Admin:Password settings.
        /// Does nothing when any user already exists or when the credentials are not configured.
        /// Returns true only when a user was created.
        /// </summary>
        public static async Task<bool> SeedAsync(AppDbContext context, IConfiguration configuration)
        {
            var email = configuration["Admin:Email"];
            var password = configuration["Admin:Password"];

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                return false;
            }

            if (await context.Users.AnyAsync())
            {
                return false;
            }

            var name = configuration["Admin:Name"];

            context.Users.Add(new User
            {
                Name = string.IsNullOrWhiteSpace(name) ? email : name,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
            });

            await context.SaveChangesAsync();

            return true;
        }
    }
}
