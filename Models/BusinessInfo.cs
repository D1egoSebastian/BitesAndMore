namespace BitesAndMore.API.Models
{
    public class BusinessInfo
    {
        public const int SingletonId = 1;

        public int Id { get; set; }
        public string? BusinessName { get; set; }
        public string? Mission { get; set; }
        public string? Vision { get; set; }
        public string? PhoneNumber { get; set; }
        public string? WhatsAppNumber { get; set; }
        public string? Address { get; set; }
        public string? Instagram { get; set; }
        public string? Facebook { get; set; }
    }
}
