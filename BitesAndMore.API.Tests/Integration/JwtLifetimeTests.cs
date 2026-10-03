using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using BitesAndMore.API.Tests.Support;

namespace BitesAndMore.API.Tests.Integration;

public class JwtLifetimeTests
{
    private static async Task<double> LoginLifetimeMinutesAsync(string? expiresMinutes)
    {
        using var factory = new ApiFactory(s =>
        {
            if (expiresMinutes != null) s["Jwt:ExpiresMinutes"] = expiresMinutes;
        });
        await factory.CreateAuthorizedClientAsync();

        var response = await factory.CreateClient().PostAsJsonAsync("/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword });
        var body = await response.Content.ReadFromJsonAsync<ApiFactory.TokenResponse>();
        var token = new JwtSecurityTokenHandler().ReadJwtToken(body!.Token);

        return (token.ValidTo - DateTime.UtcNow).TotalMinutes;
    }

    [Fact]
    public async Task Token_UsesConfiguredLifetime()
    {
        var minutes = await LoginLifetimeMinutesAsync("30");

        Assert.InRange(minutes, 29, 30.5);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("0")]
    [InlineData("-5")]
    [InlineData("abc")]
    [InlineData("")]
    public async Task Token_FallsBackTo480Minutes_WhenMissingOrInvalid(string? value)
    {
        var minutes = await LoginLifetimeMinutesAsync(value);

        Assert.InRange(minutes, 479, 480.5);
    }
}
