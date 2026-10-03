namespace BitesAndMore.API.Helpers
{
    public static class WhatsAppLinkBuilder
    {
        /// <summary>
        /// Builds a wa.me link with a prefilled message about the product.
        /// Returns null when the number or the product name is missing, so callers never expose a broken link.
        /// </summary>
        public static string? Build(string? whatsAppNumber, string? productName)
        {
            if (string.IsNullOrWhiteSpace(whatsAppNumber) || string.IsNullOrWhiteSpace(productName))
            {
                return null;
            }

            var digits = new string(whatsAppNumber.Where(char.IsAsciiDigit).ToArray());

            if (digits.Length == 0)
            {
                return null;
            }

            var message = $"Hola! Me interesa {productName.Trim()}";

            return $"https://wa.me/{digits}?text={Uri.EscapeDataString(message)}";
        }
    }
}
