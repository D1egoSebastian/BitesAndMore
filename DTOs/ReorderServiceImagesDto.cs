namespace BitesAndMore.API.DTOs
{
    public class ReorderServiceImagesDto
    {
        /// <summary>Every image id of the service, exactly once, in the new display order.</summary>
        public List<int>? ImageIds { get; set; }
    }
}
