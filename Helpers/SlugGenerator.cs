using System.Globalization;
using System.Text;

namespace BitesAndMore.API.Helpers
{
    public static class SlugGenerator
    {
        private const string FallbackSlug = "product";

        /// <summary>
        /// Builds a URL-friendly slug: lowercase, accents removed, non-alphanumeric runs collapsed into single hyphens.
        /// Returns an empty string when the input has no usable characters.
        /// </summary>
        public static string Generate(string? name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return string.Empty;
            }

            var decomposed = name.Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder(decomposed.Length);
            var pendingHyphen = false;

            foreach (var character in decomposed)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(character) == UnicodeCategory.NonSpacingMark)
                {
                    continue;
                }

                if (char.IsAsciiLetterOrDigit(character))
                {
                    if (pendingHyphen && builder.Length > 0)
                    {
                        builder.Append('-');
                    }

                    builder.Append(char.ToLowerInvariant(character));
                    pendingHyphen = false;
                }
                else
                {
                    pendingHyphen = true;
                }
            }

            return builder.ToString();
        }

        /// <summary>
        /// Generates a slug and appends a numeric suffix (-2, -3, ...) until <paramref name="existsAsync"/> reports it as free.
        /// </summary>
        public static async Task<string> GenerateUniqueAsync(string? name, Func<string, Task<bool>> existsAsync)
        {
            var baseSlug = Generate(name);

            if (baseSlug.Length == 0)
            {
                baseSlug = FallbackSlug;
            }

            var candidate = baseSlug;
            var suffix = 2;

            while (await existsAsync(candidate))
            {
                candidate = $"{baseSlug}-{suffix}";
                suffix++;
            }

            return candidate;
        }
    }
}
