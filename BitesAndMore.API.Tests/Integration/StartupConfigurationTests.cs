using System.Net;
using BitesAndMore.API.Tests.Support;

namespace BitesAndMore.API.Tests.Integration;

public class StartupConfigurationTests
{
    private static HttpRequestMessage Preflight(string origin, string method = "POST")
    {
        var request = new HttpRequestMessage(HttpMethod.Options, "/api/product");
        request.Headers.Add("Origin", origin);
        request.Headers.Add("Access-Control-Request-Method", method);
        request.Headers.Add("Access-Control-Request-Headers", "authorization,content-type");
        return request;
    }

    [Fact]
    public async Task Cors_Preflight_AllowsConfiguredOrigin_EvenForProtectedEndpoints()
    {
        using var factory = new ApiFactory();

        var response = await factory.CreateClient().SendAsync(Preflight("https://allowed.test"));

        Assert.True(response.IsSuccessStatusCode, $"Unexpected status {response.StatusCode}");
        Assert.Equal("https://allowed.test", Assert.Single(response.Headers.GetValues("Access-Control-Allow-Origin")));
    }

    [Fact]
    public async Task Cors_Preflight_RejectsOriginsThatAreNotConfigured()
    {
        using var factory = new ApiFactory();

        var response = await factory.CreateClient().SendAsync(Preflight("https://evil.test"));

        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
    }

    [Fact]
    public async Task Cors_WithoutConfiguredOrigins_AllowsNone()
    {
        using var factory = new ApiFactory(settings => settings.Remove("Cors:AllowedOrigins:0"));

        var response = await factory.CreateClient().SendAsync(Preflight("https://allowed.test"));

        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
    }

    [Fact]
    public async Task Cors_ActualRequest_ReturnsAllowOriginHeaderForConfiguredOrigin()
    {
        using var factory = new ApiFactory();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/product");
        request.Headers.Add("Origin", "https://allowed.test");

        var response = await factory.CreateClient().SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("https://allowed.test", Assert.Single(response.Headers.GetValues("Access-Control-Allow-Origin")));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Startup_FailsFast_WhenJwtKeyIsMissing(string? key)
    {
        using var factory = new ApiFactory(settings => settings["Jwt:Key"] = key);

        var exception = Assert.ThrowsAny<Exception>(() => factory.CreateClient());

        Assert.Contains("Jwt:Key", exception.ToString());
    }
}
