using BitesAndMore.API.Helpers;

namespace BitesAndMore.API.Tests.Unit;

public class WhatsAppLinkBuilderTests
{
    [Fact]
    public void Build_ReturnsWaMeLinkWithEncodedMessage()
    {
        var url = WhatsAppLinkBuilder.Build("5215551234567", "Pastel de Chocolate");

        Assert.Equal("https://wa.me/5215551234567?text=Hola%21%20Me%20interesa%20Pastel%20de%20Chocolate", url);
    }

    [Fact]
    public void Build_KeepsOnlyDigitsFromNumber()
    {
        var url = WhatsAppLinkBuilder.Build("+52 (155) 512-34567", "Cake");

        Assert.StartsWith("https://wa.me/5215551234567?text=", url);
    }

    [Fact]
    public void Build_EncodesReservedCharactersInProductName()
    {
        var url = WhatsAppLinkBuilder.Build("5215551234567", "Tarta & Café #1?");

        Assert.NotNull(url);
        var text = url!.Substring(url.IndexOf("?text=", StringComparison.Ordinal) + "?text=".Length);
        Assert.DoesNotContain("&", text);
        Assert.DoesNotContain("#", text);
        Assert.DoesNotContain("?", text);
        Assert.Equal("Hola! Me interesa Tarta & Café #1?", Uri.UnescapeDataString(text));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("no digits here")]
    public void Build_ReturnsNullWhenNumberIsMissing(string? number)
    {
        Assert.Null(WhatsAppLinkBuilder.Build(number, "Cake"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("  ")]
    public void Build_ReturnsNullWhenProductNameIsMissing(string? name)
    {
        Assert.Null(WhatsAppLinkBuilder.Build("5215551234567", name));
    }
}
