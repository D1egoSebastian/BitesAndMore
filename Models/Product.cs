namespace BitesAndMore.API.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? Price { get; set; }
        public string? imageUrl { get; set; }
        public int CategoryId { get; set; }
        //category model
        public Category? Category { get; set; }
        public bool isAvailable { get; set; }
        public DateTime? CreatedDate { get; set; }
    }
}
