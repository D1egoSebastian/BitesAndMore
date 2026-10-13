namespace BitesAndMore.API.DTOs
{
    public class ServiceImageResponseDto
    {
        public int Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public string? Caption { get; set; }
        public int SortOrder { get; set; }
    }
}
