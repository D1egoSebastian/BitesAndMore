using System.Net;
using System.Net.Http.Json;
using BitesAndMore.API.Models;
using BitesAndMore.API.Tests.Support;

namespace BitesAndMore.API.Tests.Integration;

public class CategoryAndServiceEndpointsTests : IDisposable
{
    private readonly ApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    private record CategoryBody(int Id, string? Name, string? Description);
    private record ServiceBody(int Id, string? Name, string? Description, string? ImageUrl, string? Price, string? ServiceType);

    [Fact]
    public async Task Categories_WhenEmpty_ReturnOkWithEmptyList()
    {
        var response = await _factory.CreateClient().GetAsync("/api/category");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty((await response.Content.ReadFromJsonAsync<List<CategoryBody>>())!);
    }

    [Fact]
    public async Task Services_WhenEmpty_ReturnOkWithEmptyList()
    {
        var response = await _factory.CreateClient().GetAsync("/api/service");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty((await response.Content.ReadFromJsonAsync<List<ServiceBody>>())!);
    }

    [Fact]
    public async Task PostCategory_ReturnsCreatedWithId_AndPutReturnsOkWithId()
    {
        var client = await _factory.CreateAuthorizedClientAsync();

        var created = await client.PostAsJsonAsync("/api/category", new { name = "Cakes", description = "Sweet" });
        var createdBody = await created.Content.ReadFromJsonAsync<CategoryBody>();
        var updated = await client.PutAsJsonAsync($"/api/category/{createdBody!.Id}", new { name = "Big Cakes", description = "Sweet" });
        var updatedBody = await updated.Content.ReadFromJsonAsync<CategoryBody>();

        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        Assert.NotNull(created.Headers.Location);
        Assert.True(createdBody.Id > 0);
        Assert.Equal(HttpStatusCode.OK, updated.StatusCode);
        Assert.Equal(createdBody.Id, updatedBody!.Id);
    }

    [Fact]
    public async Task PostService_StoresPriceAndServiceType_AndReturnsCreatedWithId()
    {
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PostAsJsonAsync("/api/service", new
        {
            name = "Birthday Planner",
            description = "We plan it",
            imageUrl = "https://img.test/s.jpg",
            price = "Consult us",
            serviceType = "EventsPlanner"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ServiceBody>();
        Assert.True(body!.Id > 0);
        Assert.Equal("Consult us", body.Price);
        Assert.Equal("EventsPlanner", body.ServiceType);

        var stored = await _factory.QueryAsync(db => Task.FromResult(db.Services.Single()));
        Assert.Equal(ServiceType.EventsPlanner, stored.ServiceType);
        Assert.Equal("Consult us", stored.Price);
    }

    [Fact]
    public async Task PutService_UpdatesPriceAndServiceType()
    {
        var client = await _factory.CreateAuthorizedClientAsync();
        var created = await (await client.PostAsJsonAsync("/api/service", new { name = "Breakfast", serviceType = "Reposteria" }))
            .Content.ReadFromJsonAsync<ServiceBody>();

        var response = await client.PutAsJsonAsync($"/api/service/{created!.Id}", new
        {
            name = "Breakfast",
            price = "From $300",
            serviceType = "DesayunosPersonalizados"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ServiceBody>();
        Assert.Equal(created.Id, body!.Id);
        Assert.Equal("From $300", body.Price);
        Assert.Equal("DesayunosPersonalizados", body.ServiceType);
    }
}
