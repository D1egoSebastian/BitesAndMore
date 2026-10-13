namespace BitesAndMore.API.Models
{
    public class Services
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? Price { get; set; }
        public ServiceType ServiceType { get; set; }
        public ICollection<ServiceImage> Images { get; set; } = new List<ServiceImage>();
    }
}
