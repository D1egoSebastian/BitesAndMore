using System.Net;
using System.Net.Http.Json;
using BitesAndMore.API.Models;
using BitesAndMore.API.Tests.Support;
using Microsoft.EntityFrameworkCore;

namespace BitesAndMore.API.Tests.Integration;

public class ServiceImageEndpointsTests : IDisposable
{
    private readonly ApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    private record ImageBody(int Id, string? Url, string? Caption, int SortOrder);
    private record ServiceBody(int Id, string? Name, string? ImageUrl, List<ImageBody>? Images);

    private async Task<int> SeedServiceAsync(string name, params (string Url, string? Caption, int SortOrder)[] images)
    {
        var service = new Services
        {
            Name = name,
            ImageUrl = "https://img.test/cover.jpg",
            ServiceType = ServiceType.EventsPlanner,
            Images = images.Select(i => new ServiceImage { Url = i.Url, Caption = i.Caption, SortOrder = i.SortOrder }).ToList()
        };
        await _factory.SeedAsync(db => db.Services.Add(service));
        return service.Id;
    }

    private Task<List<ServiceImage>> StoredImagesAsync(int serviceId) =>
        _factory.QueryAsync(db => db.ServiceImages.Where(i => i.ServiceId == serviceId).OrderBy(i => i.SortOrder).ToListAsync());

    // ----- Reads -----

    [Fact]
    public async Task GetServices_IncludesImagesOrderedBySortOrderThenId()
    {
        await SeedServiceAsync("Candy table",
            ("https://img.test/b.jpg", "Second", 2),
            ("https://img.test/a.jpg", "First", 1),
            ("https://img.test/c.jpg", null, 2));

        var response = await _factory.CreateClient().GetAsync("/api/service");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var service = Assert.Single((await response.Content.ReadFromJsonAsync<List<ServiceBody>>())!);
        Assert.Equal("https://img.test/cover.jpg", service.ImageUrl);
        Assert.NotNull(service.Images);
        Assert.Equal(new[] { "https://img.test/a.jpg", "https://img.test/b.jpg", "https://img.test/c.jpg" }, service.Images!.Select(i => i.Url));
        Assert.Equal("First", service.Images![0].Caption);
        Assert.Null(service.Images![2].Caption);
    }

    [Fact]
    public async Task GetServiceById_IncludesImages()
    {
        var id = await SeedServiceAsync("Breakfast", ("https://img.test/one.jpg", "Tray", 1));

        var response = await _factory.CreateClient().GetAsync($"/api/service/{id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ServiceBody>();
        var image = Assert.Single(body!.Images!);
        Assert.Equal("https://img.test/one.jpg", image.Url);
        Assert.Equal("Tray", image.Caption);
        Assert.True(image.Id > 0);
    }

    [Fact]
    public async Task GetServices_WithoutImages_ReturnsEmptyImageList()
    {
        await SeedServiceAsync("No photos");

        var service = Assert.Single((await _factory.CreateClient().GetFromJsonAsync<List<ServiceBody>>("/api/service"))!);

        Assert.NotNull(service.Images);
        Assert.Empty(service.Images!);
    }

    [Fact]
    public async Task CreateAndUpdateService_ResponsesIncludeImages()
    {
        var client = await _factory.CreateAuthorizedClientAsync();

        var created = await client.PostAsJsonAsync("/api/service", new { name = "Party", serviceType = "EventsPlanner" });
        var createdBody = await created.Content.ReadFromJsonAsync<ServiceBody>();
        await client.PostAsJsonAsync($"/api/service/{createdBody!.Id}/images", new { url = "https://img.test/p.jpg" });
        var updated = await client.PutAsJsonAsync($"/api/service/{createdBody.Id}", new { name = "Party", serviceType = "EventsPlanner" });
        var updatedBody = await updated.Content.ReadFromJsonAsync<ServiceBody>();

        Assert.NotNull(createdBody.Images);
        Assert.Empty(createdBody.Images!);
        Assert.Equal("https://img.test/p.jpg", Assert.Single(updatedBody!.Images!).Url);
    }

    // ----- Add -----

    [Fact]
    public async Task AddImage_AppendsAfterTheLastImage_AndReturnsCreated()
    {
        var id = await SeedServiceAsync("Candy table", ("https://img.test/a.jpg", null, 1), ("https://img.test/b.jpg", null, 5));
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PostAsJsonAsync($"/api/service/{id}/images", new { url = "  https://img.test/new.jpg ", caption = " Macarons " });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
        var body = await response.Content.ReadFromJsonAsync<ImageBody>();
        Assert.True(body!.Id > 0);
        Assert.Equal("https://img.test/new.jpg", body.Url);
        Assert.Equal("Macarons", body.Caption);
        Assert.Equal(6, body.SortOrder);

        var stored = await StoredImagesAsync(id);
        Assert.Equal(3, stored.Count);
        Assert.Equal("https://img.test/new.jpg", stored.Last().Url);
    }

    [Fact]
    public async Task AddImage_ToServiceWithoutImages_StartsAtOne_AndBlankCaptionIsNull()
    {
        var id = await SeedServiceAsync("Empty");
        var client = await _factory.CreateAuthorizedClientAsync();

        var body = await (await client.PostAsJsonAsync($"/api/service/{id}/images", new { url = "https://img.test/x.jpg", caption = "  " }))
            .Content.ReadFromJsonAsync<ImageBody>();

        Assert.Equal(1, body!.SortOrder);
        Assert.Null(body.Caption);
    }

    [Fact]
    public async Task AddImage_WhenServiceIsMissing_ReturnsNotFound()
    {
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PostAsJsonAsync("/api/service/999/images", new { url = "https://img.test/x.jpg" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Empty(await _factory.QueryAsync(db => db.ServiceImages.ToListAsync()));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task AddImage_WithBlankUrl_ReturnsBadRequest(string? url)
    {
        var id = await SeedServiceAsync("Candy table");
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PostAsJsonAsync($"/api/service/{id}/images", new { url });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("the image url is required", await ReadMessageAsync(response));
        Assert.Empty(await StoredImagesAsync(id));
    }

    [Fact]
    public async Task AddImage_WhenServiceAlreadyHasTwelveImages_ReturnsBadRequest()
    {
        var images = Enumerable.Range(1, 12).Select(i => ($"https://img.test/{i}.jpg", (string?)null, i)).ToArray();
        var id = await SeedServiceAsync("Full", images);
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PostAsJsonAsync($"/api/service/{id}/images", new { url = "https://img.test/13.jpg" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("a service can have at most 12 images", await ReadMessageAsync(response));
        Assert.Equal(12, (await StoredImagesAsync(id)).Count);
    }

    // ----- Delete -----

    [Fact]
    public async Task DeleteImage_RemovesOnlyThatImage_AndReturnsNoContent()
    {
        var id = await SeedServiceAsync("Candy table", ("https://img.test/a.jpg", null, 1), ("https://img.test/b.jpg", null, 2));
        var target = (await StoredImagesAsync(id)).First();
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.DeleteAsync($"/api/service/{id}/images/{target.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal("https://img.test/b.jpg", Assert.Single(await StoredImagesAsync(id)).Url);
    }

    [Fact]
    public async Task DeleteImage_ThatBelongsToAnotherService_ReturnsNotFound_AndKeepsIt()
    {
        var ownerId = await SeedServiceAsync("Owner", ("https://img.test/a.jpg", null, 1));
        var otherId = await SeedServiceAsync("Other");
        var image = (await StoredImagesAsync(ownerId)).Single();
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.DeleteAsync($"/api/service/{otherId}/images/{image.Id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Single(await StoredImagesAsync(ownerId));
    }

    [Fact]
    public async Task DeleteImage_WhenImageIsMissing_ReturnsNotFound()
    {
        var id = await SeedServiceAsync("Candy table");
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.DeleteAsync($"/api/service/{id}/images/12345");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ----- Reorder -----

    [Fact]
    public async Task ReorderImages_RewritesSortOrderInTheGivenOrder()
    {
        var id = await SeedServiceAsync("Candy table",
            ("https://img.test/a.jpg", null, 1), ("https://img.test/b.jpg", null, 2), ("https://img.test/c.jpg", null, 3));
        var ids = (await StoredImagesAsync(id)).Select(i => i.Id).ToArray();
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PutAsJsonAsync($"/api/service/{id}/images/order", new { imageIds = new[] { ids[2], ids[0], ids[1] } });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var service = await _factory.CreateClient().GetFromJsonAsync<ServiceBody>($"/api/service/{id}");
        Assert.Equal(new[] { "https://img.test/c.jpg", "https://img.test/a.jpg", "https://img.test/b.jpg" }, service!.Images!.Select(i => i.Url));
        Assert.Equal(new[] { 1, 2, 3 }, service.Images!.Select(i => i.SortOrder));
    }

    public static TheoryData<string> InvalidOrders => new() { "missing", "duplicate", "foreign", "empty" };

    [Theory]
    [MemberData(nameof(InvalidOrders))]
    public async Task ReorderImages_WithoutExactlyTheServiceImages_ReturnsBadRequest_AndKeepsTheOrder(string kind)
    {
        var id = await SeedServiceAsync("Candy table", ("https://img.test/a.jpg", null, 1), ("https://img.test/b.jpg", null, 2));
        var foreignId = await SeedServiceAsync("Other", ("https://img.test/z.jpg", null, 1));
        var ids = (await StoredImagesAsync(id)).Select(i => i.Id).ToArray();
        var foreign = (await StoredImagesAsync(foreignId)).Single().Id;
        int[] imageIds = kind switch
        {
            "missing" => [ids[1]],
            "duplicate" => [ids[1], ids[1], ids[0]],
            "foreign" => [ids[1], foreign],
            _ => [],
        };
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PutAsJsonAsync($"/api/service/{id}/images/order", new { imageIds });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("the order must list each image of the service exactly once", await ReadMessageAsync(response));
        Assert.Equal(new[] { "https://img.test/a.jpg", "https://img.test/b.jpg" }, (await StoredImagesAsync(id)).Select(i => i.Url));
    }

    [Fact]
    public async Task ReorderImages_WhenServiceIsMissing_ReturnsNotFound()
    {
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PutAsJsonAsync("/api/service/999/images/order", new { imageIds = new[] { 1 } });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ----- Caption -----

    [Fact]
    public async Task UpdateCaption_ChangesOnlyTheCaption_AndReturnsTheImage()
    {
        var id = await SeedServiceAsync("Candy table", ("https://img.test/a.jpg", "Old", 4));
        var image = (await StoredImagesAsync(id)).Single();
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PatchAsJsonAsync($"/api/service/{id}/images/{image.Id}", new { caption = "  Macaron tower " });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ImageBody>();
        Assert.Equal(image.Id, body!.Id);
        Assert.Equal("Macaron tower", body.Caption);
        Assert.Equal("https://img.test/a.jpg", body.Url);
        Assert.Equal(4, body.SortOrder);
        Assert.Equal("Macaron tower", (await StoredImagesAsync(id)).Single().Caption);
    }

    [Fact]
    public async Task UpdateCaption_WithBlankCaption_ClearsIt()
    {
        var id = await SeedServiceAsync("Candy table", ("https://img.test/a.jpg", "Old", 1));
        var image = (await StoredImagesAsync(id)).Single();
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PatchAsJsonAsync($"/api/service/{id}/images/{image.Id}", new { caption = " " });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null((await StoredImagesAsync(id)).Single().Caption);
    }

    [Fact]
    public async Task UpdateCaption_OfAnotherServiceImage_ReturnsNotFound()
    {
        var ownerId = await SeedServiceAsync("Owner", ("https://img.test/a.jpg", "Keep", 1));
        var otherId = await SeedServiceAsync("Other");
        var image = (await StoredImagesAsync(ownerId)).Single();
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PatchAsJsonAsync($"/api/service/{otherId}/images/{image.Id}", new { caption = "Changed" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("Keep", (await StoredImagesAsync(ownerId)).Single().Caption);
    }

    // ----- Authorization -----

    [Fact]
    public async Task GalleryWrites_WithoutToken_ReturnUnauthorized()
    {
        var id = await SeedServiceAsync("Candy table", ("https://img.test/a.jpg", null, 1));
        var imageId = (await StoredImagesAsync(id)).Single().Id;
        var client = _factory.CreateClient();

        var add = await client.PostAsJsonAsync($"/api/service/{id}/images", new { url = "https://img.test/x.jpg" });
        var patch = await client.PatchAsJsonAsync($"/api/service/{id}/images/{imageId}", new { caption = "x" });
        var delete = await client.DeleteAsync($"/api/service/{id}/images/{imageId}");
        var order = await client.PutAsJsonAsync($"/api/service/{id}/images/order", new { imageIds = new[] { imageId } });

        Assert.Equal(HttpStatusCode.Unauthorized, add.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, patch.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, delete.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, order.StatusCode);
        Assert.Single(await StoredImagesAsync(id));
    }

    private record MessageBody(string? Message);

    private static async Task<string?> ReadMessageAsync(HttpResponseMessage response) =>
        (await response.Content.ReadFromJsonAsync<MessageBody>())?.Message;
}
