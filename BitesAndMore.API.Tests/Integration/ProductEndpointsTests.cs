using System.Net;
using System.Net.Http.Json;
using BitesAndMore.API.Models;
using BitesAndMore.API.Tests.Support;

namespace BitesAndMore.API.Tests.Integration;

public class ProductEndpointsTests : IDisposable
{
    private readonly ApiFactory _factory = new();

    public ProductEndpointsTests()
    {
        // The foreign key to Category is enforced by the real database, so products need an existing category.
        _factory.SeedAsync(db => db.Categories.Add(new Category { Id = 1, Name = "Cakes" })).GetAwaiter().GetResult();
    }

    public void Dispose() => _factory.Dispose();

    private record ProductBody(int Id, string? Name, string? Slug, string? Price, int CategoryId, string? WhatsAppUrl, CategoryBody? Category);
    private record CategoryBody(int Id, string? Name);
    private record UrlBody(string? Url);

    private static object NewProduct(string name, string? price = "Desde $500", int categoryId = 1) => new
    {
        name,
        description = "Tasty",
        price,
        imageUrl = "https://img.test/a.jpg",
        categoryId,
        isAvailable = true
    };

    private Task SeedBusinessInfoAsync(string? whatsApp) => _factory.SeedAsync(db =>
        db.BusinessInfos.Add(new BusinessInfo { Id = 1, BusinessName = "Bites", WhatsAppNumber = whatsApp }));

    [Fact]
    public async Task Post_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/product", NewProduct("Cake"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Post_CreatesProductWithSlugAndTextPrice()
    {
        var client = await _factory.CreateAuthorizedClientAsync();

        var response = await client.PostAsJsonAsync("/api/product", NewProduct("Pastel de Chocolate"));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
        var body = await response.Content.ReadFromJsonAsync<ProductBody>();
        Assert.True(body!.Id > 0);
        Assert.Equal("pastel-de-chocolate", body.Slug);
        Assert.Equal("Desde $500", body.Price);
    }

    [Fact]
    public async Task Post_DuplicateName_ReturnsBadRequest()
    {
        var client = await _factory.CreateAuthorizedClientAsync();
        await client.PostAsJsonAsync("/api/product", NewProduct("Cake"));

        var response = await client.PostAsJsonAsync("/api/product", NewProduct("Cake"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Post_NamesProducingSameSlug_GetNumericSuffix()
    {
        var client = await _factory.CreateAuthorizedClientAsync();
        await client.PostAsJsonAsync("/api/product", NewProduct("Pastel de Chocolate"));

        var response = await client.PostAsJsonAsync("/api/product", NewProduct("Pastel de chocolate!"));

        var body = await response.Content.ReadFromJsonAsync<ProductBody>();
        Assert.Equal("pastel-de-chocolate-2", body!.Slug);
    }

    [Fact]
    public async Task Put_RegeneratesSlugOnlyWhenNameChanges()
    {
        var client = await _factory.CreateAuthorizedClientAsync();
        var created = await (await client.PostAsJsonAsync("/api/product", NewProduct("Cake")))
            .Content.ReadFromJsonAsync<ProductBody>();

        var sameName = await client.PutAsJsonAsync($"/api/product/{created!.Id}", NewProduct("Cake", price: "Desde $900"));
        var sameNameBody = await sameName.Content.ReadFromJsonAsync<ProductBody>();

        var renamed = await client.PutAsJsonAsync($"/api/product/{created.Id}", NewProduct("Red Velvet Cake"));
        var renamedBody = await renamed.Content.ReadFromJsonAsync<ProductBody>();

        Assert.Equal(HttpStatusCode.OK, sameName.StatusCode);
        Assert.Equal("cake", sameNameBody!.Slug);
        Assert.Equal("Desde $900", sameNameBody.Price);
        Assert.Equal("red-velvet-cake", renamedBody!.Slug);
        Assert.Equal(created.Id, renamedBody.Id);
    }

    [Fact]
    public async Task GetBySlug_ReturnsProduct_Or404()
    {
        var client = await _factory.CreateAuthorizedClientAsync();
        await client.PostAsJsonAsync("/api/product", NewProduct("Pastel de Chocolate"));
        var anonymous = _factory.CreateClient();

        var found = await anonymous.GetAsync("/api/product/slug/pastel-de-chocolate");
        var missing = await anonymous.GetAsync("/api/product/slug/unknown");

        Assert.Equal(HttpStatusCode.OK, found.StatusCode);
        Assert.Equal("Pastel de Chocolate", (await found.Content.ReadFromJsonAsync<ProductBody>())!.Name);
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }

    [Fact]
    public async Task GetAll_WhenEmpty_ReturnsOkWithEmptyList()
    {
        var response = await _factory.CreateClient().GetAsync("/api/product");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty((await response.Content.ReadFromJsonAsync<List<ProductBody>>())!);
    }

    [Fact]
    public async Task GetAll_FiltersByCategoryAndIncludesCategory()
    {
        await _factory.SeedAsync(db =>
        {
            db.Categories.Add(new Category { Id = 2, Name = "Cookies" });
            db.Products.AddRange(
                new Product { Name = "Cake A", Slug = "cake-a", CategoryId = 1 },
                new Product { Name = "Cake B", Slug = "cake-b", CategoryId = 1 },
                new Product { Name = "Cookie", Slug = "cookie", CategoryId = 2 });
        });
        var client = _factory.CreateClient();

        var all = await client.GetFromJsonAsync<List<ProductBody>>("/api/product");
        var cakes = await client.GetFromJsonAsync<List<ProductBody>>("/api/product?categoryId=1");

        Assert.Equal(3, all!.Count);
        Assert.Equal(2, cakes!.Count);
        Assert.All(cakes, p => Assert.Equal("Cakes", p.Category!.Name));
    }

    [Fact]
    public async Task WhatsApp_ReturnsLinkWhenBusinessInfoHasNumber()
    {
        await SeedBusinessInfoAsync("+52 155 5123 4567");
        var client = await _factory.CreateAuthorizedClientAsync();
        var created = await (await client.PostAsJsonAsync("/api/product", NewProduct("Pastel de Chocolate")))
            .Content.ReadFromJsonAsync<ProductBody>();

        var response = await _factory.CreateClient().GetAsync($"/api/product/{created!.Id}/whatsapp");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<UrlBody>();
        Assert.Equal("https://wa.me/5215551234567?text=Hola%21%20Me%20interesa%20Pastel%20de%20Chocolate", body!.Url);
    }

    [Theory]
    [InlineData(false, null)]
    [InlineData(true, null)]
    [InlineData(true, "")]
    public async Task WhatsApp_Returns404WhenBusinessInfoOrNumberMissing(bool createBusinessInfo, string? number)
    {
        if (createBusinessInfo)
        {
            await SeedBusinessInfoAsync(number);
        }

        var client = await _factory.CreateAuthorizedClientAsync();
        var created = await (await client.PostAsJsonAsync("/api/product", NewProduct("Cake")))
            .Content.ReadFromJsonAsync<ProductBody>();

        var response = await _factory.CreateClient().GetAsync($"/api/product/{created!.Id}/whatsapp");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task WhatsApp_UnknownProduct_Returns404()
    {
        await SeedBusinessInfoAsync("5215551234567");

        var response = await _factory.CreateClient().GetAsync("/api/product/999/whatsapp");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ProductResponses_IncludeWhatsAppUrl_OnlyWhenConfigured()
    {
        var client = await _factory.CreateAuthorizedClientAsync();
        var created = await (await client.PostAsJsonAsync("/api/product", NewProduct("Cake")))
            .Content.ReadFromJsonAsync<ProductBody>();
        var anonymous = _factory.CreateClient();

        var before = await anonymous.GetFromJsonAsync<ProductBody>($"/api/product/{created!.Id}");
        await SeedBusinessInfoAsync("5215551234567");
        var after = await anonymous.GetFromJsonAsync<ProductBody>($"/api/product/{created.Id}");
        var list = await anonymous.GetFromJsonAsync<List<ProductBody>>("/api/product");

        Assert.Null(before!.WhatsAppUrl);
        Assert.Equal("https://wa.me/5215551234567?text=Hola%21%20Me%20interesa%20Cake", after!.WhatsAppUrl);
        Assert.Equal(after.WhatsAppUrl, list!.Single().WhatsAppUrl);
    }

    [Fact]
    public async Task Delete_WithoutToken_ReturnsUnauthorized()
    {
        var response = await _factory.CreateClient().DeleteAsync("/api/product/1");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
