using System.Net;
using System.Net.Http.Json;
using BitesAndMore.API.Data;
using BitesAndMore.API.Tests.Support;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BitesAndMore.API.Tests.Integration;

public class HealthEndpointTests
{
    private record HealthBody(string? Status);

    // Port 1 on loopback is closed: Npgsql fails fast with "connection refused".
    private const string UnreachableDatabase = "Host=127.0.0.1;Port=1;Database=none;Username=none;Password=none;Timeout=2";

    [Fact]
    public async Task Health_WithoutToken_ReturnsOkWithStatus()
    {
        using var factory = new ApiFactory();

        var response = await factory.CreateClient().GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("ok", (await response.Content.ReadFromJsonAsync<HealthBody>())!.Status);
    }

    [Fact]
    public async Task Health_WhenDatabaseIsUnreachable_StillReturnsOk()
    {
        using var factory = new ApiFactory();
        using var brokenDatabase = factory.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options => options.UseNpgsql(UnreachableDatabase));
        }));
        var client = brokenDatabase.CreateClient();

        var health = await client.GetAsync("/health");
        // Control: an endpoint that reads the database fails, so the database really is unavailable.
        var categories = await client.GetAsync("/api/category");

        Assert.Equal(HttpStatusCode.OK, health.StatusCode);
        Assert.Equal(HttpStatusCode.InternalServerError, categories.StatusCode);
    }
}
