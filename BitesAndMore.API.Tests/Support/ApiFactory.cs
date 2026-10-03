using System.Net.Http.Headers;
using System.Net.Http.Json;
using BitesAndMore.API.Data;
using BitesAndMore.API.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BitesAndMore.API.Tests.Support;

/// <summary>
/// Boots the API against an isolated EF InMemory database. All settings are test-only values.
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>
{
    public const string AdminEmail = "admin@test.local";
    public const string AdminPassword = "test-password-1";

    private readonly string _databaseName = Guid.NewGuid().ToString();
    private readonly Dictionary<string, string?> _settings;

    public ApiFactory(Action<Dictionary<string, string?>>? configure = null)
    {
        _settings = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "integration-tests-signing-key-0123456789-abcdef",
            ["Jwt:Issuer"] = "bitesandmore-tests",
            ["Jwt:Audience"] = "bitesandmore-tests",
            ["Cors:AllowedOrigins:0"] = "https://allowed.test",
            ["Admin:Email"] = "",
            ["Admin:Name"] = "",
            ["Admin:Password"] = ""
        };

        configure?.Invoke(_settings);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        foreach (var setting in _settings)
        {
            builder.UseSetting(setting.Key, setting.Value);
        }

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(_databaseName));
        });
    }

    public async Task SeedAsync(Action<AppDbContext> seed)
    {
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        seed(context);
        await context.SaveChangesAsync();
    }

    public async Task<T> QueryAsync<T>(Func<AppDbContext, Task<T>> query)
    {
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await query(context);
    }

    public async Task<HttpClient> CreateAuthorizedClientAsync()
    {
        await SeedAsync(context => context.Users.Add(new User
        {
            Name = "Test Admin",
            Email = AdminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(AdminPassword)
        }));

        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email = AdminEmail, password = AdminPassword });
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<TokenResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body!.Token);

        return client;
    }

    public record TokenResponse(string Token);
}
