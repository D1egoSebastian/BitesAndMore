using BitesAndMore.API.Models;

namespace BitesAndMore.API.DTOs
{
    public class CreateServiceDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? Price { get; set; }
        public ServiceType ServiceType { get; set; }
    }
}
