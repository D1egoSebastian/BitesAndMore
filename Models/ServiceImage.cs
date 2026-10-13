namespace BitesAndMore.API.Models
{
    /// <summary>A photo in a service's gallery. The service's own ImageUrl stays as its cover.</summary>
    public class ServiceImage
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }
        public Services? Service { get; set; }
        public string Url { get; set; } = string.Empty;
        public string? Caption { get; set; }
        public int SortOrder { get; set; }
    }
}
