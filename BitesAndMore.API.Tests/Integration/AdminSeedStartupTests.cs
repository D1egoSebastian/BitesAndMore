using System.Net;
using System.Net.Http.Json;
using BitesAndMore.API.Tests.Support;
using Microsoft.EntityFrameworkCore;

namespace BitesAndMore.API.Tests.Integration;

public class AdminSeedStartupTests
{
    [Fact]
    public async Task Startup_SeedsAdminFromConfiguration_AndLoginWorks()
    {
        using var factory = new ApiFactory(settings =>
        {
            settings["Admin:Email"] = "startup-admin@test.local";
            settings["Admin:Name"] = "Startup Admin";
            settings["Admin:Password"] = "startup-password-1";
        });

        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { email = "startup-admin@test.local", password = "startup-password-1" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(1, await factory.QueryAsync(db => db.Users.CountAsync()));
    }

    [Fact]
    public async Task Startup_WithoutAdminConfiguration_CreatesNoUsers()
    {
        using var factory = new ApiFactory();
        factory.CreateClient();

        Assert.Equal(0, await factory.QueryAsync(db => db.Users.CountAsync()));
    }
}
