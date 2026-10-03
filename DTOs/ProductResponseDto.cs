using BitesAndMore.API.Models;

namespace BitesAndMore.API.DTOs
{
    public class ProductResponseDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public string? Price { get; set; }
        public string? imageUrl { get; set; }
        public int CategoryId { get; set; }
        //category model
        public Category? Category { get; set; }
        public bool isAvailable { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? WhatsAppUrl { get; set; }
    }
}
