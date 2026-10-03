using System.Net;
using System.Net.Http.Json;
using BitesAndMore.API.Tests.Support;

namespace BitesAndMore.API.Tests.Integration;

public class ChangePasswordEndpointTests : IDisposable
{
    private readonly ApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    private Task<HttpResponseMessage> Login(string password) =>
        _factory.CreateClient().PostAsJsonAsync("/api/auth/login", new { email = ApiFactory.AdminEmail, password });

    [Fact]
    public async Task Anonymous_ReturnsUnauthorized()
    {
        var response = await _factory.CreateClient().PostAsJsonAsync("/api/auth/change-password",
            new { currentPassword = ApiFactory.AdminPassword, newPassword = "another-password-1" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task WrongCurrentPassword_ReturnsUnauthorized_AndKeepsOldPassword()
    {
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PostAsJsonAsync("/api/auth/change-password",
            new { currentPassword = "not-the-password", newPassword = "another-password-1" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Login(ApiFactory.AdminPassword)).StatusCode);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("      ")]
    [InlineData("short1")]
    [InlineData("1234567")]
    public async Task InvalidNewPassword_ReturnsBadRequest(string? newPassword)
    {
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PostAsJsonAsync("/api/auth/change-password",
            new { currentPassword = ApiFactory.AdminPassword, newPassword });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Login(ApiFactory.AdminPassword)).StatusCode);
    }

    [Fact]
    public async Task NewPasswordEqualToCurrent_ReturnsBadRequest()
    {
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PostAsJsonAsync("/api/auth/change-password",
            new { currentPassword = ApiFactory.AdminPassword, newPassword = ApiFactory.AdminPassword });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Success_ReturnsNoContent_OldPasswordStopsWorking_NewOneLogsIn()
    {
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PostAsJsonAsync("/api/auth/change-password",
            new { currentPassword = ApiFactory.AdminPassword, newPassword = "brand-new-password-1" });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Login(ApiFactory.AdminPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Login("brand-new-password-1")).StatusCode);
        var stored = await _factory.QueryAsync(db => Task.FromResult(db.Users.Single().PasswordHash));
        Assert.NotEqual("brand-new-password-1", stored);
    }
}
