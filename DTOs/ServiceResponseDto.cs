using BitesAndMore.API.Models;

namespace BitesAndMore.API.DTOs
{
    public class ServiceResponseDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? Price { get; set; }
        public ServiceType ServiceType { get; set; }
        /// <summary>Gallery photos, ordered by SortOrder then Id. The cover stays in ImageUrl.</summary>
        public List<ServiceImageResponseDto> Images { get; set; } = new();
    }
}
