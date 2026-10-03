using System.Net;
using System.Net.Http.Json;
using BitesAndMore.API.Tests.Support;

namespace BitesAndMore.API.Tests.Integration;

public class AuthEndpointsTests : IDisposable
{
    private readonly ApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    [Fact]
    public async Task Register_NoLongerExists()
    {
        var response = await _factory.CreateClient().PostAsJsonAsync("/api/auth/register",
            new { name = "Intruder", email = "intruder@test.local", password = "whatever-1" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal(0, await _factory.QueryAsync(db => Task.FromResult(db.Users.Count())));
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken_ThatAuthorizesProtectedEndpoints()
    {
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PutAsJsonAsync("/api/businessinfo", new { businessName = "Bites" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        await _factory.CreateAuthorizedClientAsync();

        var response = await _factory.CreateClient().PostAsJsonAsync("/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = "wrong-password" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithUnknownEmail_ReturnsUnauthorized()
    {
        var response = await _factory.CreateClient().PostAsJsonAsync("/api/auth/login",
            new { email = "nobody@test.local", password = "whatever-1" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithMissingPassword_ReturnsUnauthorized()
    {
        await _factory.CreateAuthorizedClientAsync();

        var response = await _factory.CreateClient().PostAsJsonAsync("/api/auth/login",
            new { email = ApiFactory.AdminEmail });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
