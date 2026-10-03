using BitesAndMore.API.Helpers;

namespace BitesAndMore.API.Tests.Unit;

public class SlugGeneratorTests
{
    [Theory]
    [InlineData("Pastel de Chocolate", "pastel-de-chocolate")]
    [InlineData("Crème Brûlée", "creme-brulee")]
    [InlineData("Piñata Cake", "pinata-cake")]
    [InlineData("  Tarta   &  Café!! ", "tarta-cafe")]
    [InlineData("Red--Velvet__Cupcake", "red-velvet-cupcake")]
    [InlineData("Cake 3 Leches", "cake-3-leches")]
    public void Generate_NormalizesName(string name, string expected)
    {
        Assert.Equal(expected, SlugGenerator.Generate(name));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("!!!")]
    public void Generate_ReturnsEmptyWhenNothingUsable(string? name)
    {
        Assert.Equal(string.Empty, SlugGenerator.Generate(name));
    }

    [Fact]
    public async Task GenerateUniqueAsync_ReturnsBaseSlugWhenFree()
    {
        var slug = await SlugGenerator.GenerateUniqueAsync("Pastel de Chocolate", _ => Task.FromResult(false));

        Assert.Equal("pastel-de-chocolate", slug);
    }

    [Fact]
    public async Task GenerateUniqueAsync_AppendsNumericSuffixOnCollision()
    {
        var taken = new HashSet<string> { "pastel", "pastel-2" };

        var slug = await SlugGenerator.GenerateUniqueAsync("Pastel", s => Task.FromResult(taken.Contains(s)));

        Assert.Equal("pastel-3", slug);
    }

    [Fact]
    public async Task GenerateUniqueAsync_FallsBackToDefaultWhenNameHasNoUsableCharacters()
    {
        var slug = await SlugGenerator.GenerateUniqueAsync("???", _ => Task.FromResult(false));

        Assert.Equal("product", slug);
    }
}
