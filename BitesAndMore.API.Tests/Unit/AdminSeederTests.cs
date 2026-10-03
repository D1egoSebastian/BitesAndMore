using BitesAndMore.API.Data;
using BitesAndMore.API.Helpers;
using BitesAndMore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace BitesAndMore.API.Tests.Unit;

public class AdminSeederTests
{
    private const string SeedPassword = "seed-password-for-tests";

    private static AppDbContext NewContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static IConfiguration NewConfig(string? email = "seed-admin@test.local", string? name = "Seed Admin", string? password = SeedPassword)
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Admin:Email"] = email,
                ["Admin:Name"] = name,
                ["Admin:Password"] = password
            })
            .Build();
    }

    [Fact]
    public async Task SeedAsync_CreatesAdminWithHashedPasswordWhenNoUsersExist()
    {
        using var context = NewContext();

        var created = await AdminSeeder.SeedAsync(context, NewConfig());

        Assert.True(created);
        var user = await context.Users.SingleAsync();
        Assert.Equal("seed-admin@test.local", user.Email);
        Assert.Equal("Seed Admin", user.Name);
        Assert.NotEqual(SeedPassword, user.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(SeedPassword, user.PasswordHash));
    }

    [Fact]
    public async Task SeedAsync_IsIdempotent()
    {
        using var context = NewContext();

        var first = await AdminSeeder.SeedAsync(context, NewConfig());
        var second = await AdminSeeder.SeedAsync(context, NewConfig());

        Assert.True(first);
        Assert.False(second);
        Assert.Equal(1, await context.Users.CountAsync());
    }

    [Fact]
    public async Task SeedAsync_DoesNothingWhenAUserAlreadyExists()
    {
        using var context = NewContext();
        context.Users.Add(new User { Name = "Existing", Email = "existing@test.local", PasswordHash = "hash" });
        await context.SaveChangesAsync();

        var created = await AdminSeeder.SeedAsync(context, NewConfig());

        Assert.False(created);
        Assert.Equal("existing@test.local", (await context.Users.SingleAsync()).Email);
    }

    [Theory]
    [InlineData(null, "Seed Admin", SeedPassword)]
    [InlineData("", "Seed Admin", SeedPassword)]
    [InlineData("seed-admin@test.local", "Seed Admin", null)]
    [InlineData("seed-admin@test.local", "Seed Admin", "")]
    public async Task SeedAsync_SkipsWhenCredentialsAreNotConfigured(string? email, string? name, string? password)
    {
        using var context = NewContext();

        var created = await AdminSeeder.SeedAsync(context, NewConfig(email, name, password));

        Assert.False(created);
        Assert.Empty(context.Users);
    }

    [Fact]
    public async Task SeedAsync_UsesEmailAsNameWhenNameIsMissing()
    {
        using var context = NewContext();

        await AdminSeeder.SeedAsync(context, NewConfig(name: null));

        Assert.Equal("seed-admin@test.local", (await context.Users.SingleAsync()).Name);
    }
}
