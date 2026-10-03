using System.Net;
using System.Net.Http.Json;
using BitesAndMore.API.Models;
using BitesAndMore.API.Tests.Support;
using Microsoft.EntityFrameworkCore;

namespace BitesAndMore.API.Tests.Integration;

public class BusinessInfoEndpointsTests : IDisposable
{
    private readonly ApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    private record InfoBody(string? BusinessName, string? Mission, string? Vision, string? PhoneNumber,
        string? WhatsAppNumber, string? Address, string? Instagram, string? Facebook);

    private static InfoBody SampleInfo(string businessName = "Bites and More", string whatsApp = "5215551234567") =>
        new(businessName, "Our mission", "Our vision", "5551234567", whatsApp, "Main St 1", "@bites", "bites.fb");

    [Fact]
    public async Task Get_WhenNotConfigured_Returns404()
    {
        var response = await _factory.CreateClient().GetAsync("/api/businessinfo");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Get_IsPublicAndReturnsStoredInfo()
    {
        await _factory.SeedAsync(db => db.BusinessInfos.Add(new BusinessInfo
        {
            Id = 1,
            BusinessName = "Bites and More",
            WhatsAppNumber = "5215551234567",
            Instagram = "@bites"
        }));

        var response = await _factory.CreateClient().GetAsync("/api/businessinfo");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<InfoBody>();
        Assert.Equal("Bites and More", body!.BusinessName);
        Assert.Equal("5215551234567", body.WhatsAppNumber);
        Assert.Equal("@bites", body.Instagram);
    }

    [Fact]
    public async Task Put_WithoutToken_ReturnsUnauthorized()
    {
        var response = await _factory.CreateClient().PutAsJsonAsync("/api/businessinfo", SampleInfo());

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Put_CreatesSingletonWhenMissing()
    {
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PutAsJsonAsync("/api/businessinfo", SampleInfo());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var stored = await _factory.QueryAsync(db => db.BusinessInfos.SingleAsync());
        Assert.Equal(1, stored.Id);
        Assert.Equal("Bites and More", stored.BusinessName);
        Assert.Equal("Our mission", stored.Mission);
        Assert.Equal("Our vision", stored.Vision);
        Assert.Equal("5551234567", stored.PhoneNumber);
        Assert.Equal("5215551234567", stored.WhatsAppNumber);
        Assert.Equal("Main St 1", stored.Address);
        Assert.Equal("@bites", stored.Instagram);
        Assert.Equal("bites.fb", stored.Facebook);
    }

    [Fact]
    public async Task Put_UpdatesExistingRowInsteadOfCreatingAnother()
    {
        var client = await _factory.CreateAuthorizedClientAsync();
        await client.PutAsJsonAsync("/api/businessinfo", SampleInfo());

        var response = await client.PutAsJsonAsync("/api/businessinfo", SampleInfo("Renamed Bakery", "5219998887777"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var stored = await _factory.QueryAsync(db => db.BusinessInfos.SingleAsync());
        Assert.Equal("Renamed Bakery", stored.BusinessName);
        Assert.Equal("5219998887777", stored.WhatsAppNumber);

        var fetched = await _factory.CreateClient().GetFromJsonAsync<InfoBody>("/api/businessinfo");
        Assert.Equal("Renamed Bakery", fetched!.BusinessName);
    }
}
