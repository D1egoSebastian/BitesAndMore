using BitesAndMore.API.Data;
using BitesAndMore.API.DTOs;
using BitesAndMore.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BitesAndMore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        /// <summary>Gallery size limit per service (the cover in ImageUrl is not counted).</summary>
        public const int MaxImagesPerService = 12;

        private readonly AppDbContext _context;

        public ServiceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetServices()
        {
            var services = await _context.Services.Include(x => x.Images).ToListAsync();

            return Ok(services.Select(ToResponse));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
        {
            var findservice = await _context.Services.FirstOrDefaultAsync(x => x.Name == dto.Name);

            if (findservice != null)
            {
                return BadRequest(new { message = "that service already exist" });
            }

            var newService = new Services
            {
                Name = dto.Name,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                Price = dto.Price,
                ServiceType = dto.ServiceType,
            };

            _context.Services.Add(newService);
            await _context.SaveChangesAsync();

            var response = ToResponse(newService);

            return CreatedAtAction(nameof(GetServiceById), new { id = newService.Id }, response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetServiceById(int id)
        {
            var findservice = await _context.Services.Include(x => x.Images).FirstOrDefaultAsync(x => x.Id == id);

            if (findservice == null)
            {
                return NotFound(new { message = "no service to show with that id!" });
            }

            return Ok(ToResponse(findservice));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateService(int id, [FromBody] CreateServiceDto dto)
        {
            var findservice = await _context.Services.Include(x => x.Images).FirstOrDefaultAsync(x => x.Id == id);

            if (findservice == null)
            {
                return NotFound(new { message = "no service to show with that id!" });
            }

            findservice.Name = dto.Name;
            findservice.Description = dto.Description;
            findservice.ImageUrl = dto.ImageUrl;
            findservice.Price = dto.Price;
            findservice.ServiceType = dto.ServiceType;

            await _context.SaveChangesAsync();

            return Ok(ToResponse(findservice));
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteService(int id)
        {
            var findservice = await _context.Services.FirstOrDefaultAsync(x => x.Id == id);

            if (findservice == null)
            {
                return NotFound(new { message = "no service to show with that id!" });
            }

            _context.Services.Remove(findservice);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/images")]
        [Authorize]
        public async Task<IActionResult> AddImage(int id, [FromBody] AddServiceImageDto dto)
        {
            var url = dto.Url?.Trim();

            if (string.IsNullOrEmpty(url))
            {
                return BadRequest(new { message = "the image url is required" });
            }

            var findservice = await _context.Services.Include(x => x.Images).FirstOrDefaultAsync(x => x.Id == id);

            if (findservice == null)
            {
                return NotFound(new { message = "no service to show with that id!" });
            }

            if (findservice.Images.Count >= MaxImagesPerService)
            {
                return BadRequest(new { message = $"a service can have at most {MaxImagesPerService} images" });
            }

            var image = new ServiceImage
            {
                Url = url,
                Caption = NormalizeCaption(dto.Caption),
                SortOrder = findservice.Images.Count == 0 ? 1 : findservice.Images.Max(i => i.SortOrder) + 1,
            };

            findservice.Images.Add(image);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetServiceById), new { id }, ToImageResponse(image));
        }

        [HttpPatch("{id}/images/{imageId}")]
        [Authorize]
        public async Task<IActionResult> UpdateImageCaption(int id, int imageId, [FromBody] UpdateServiceImageDto dto)
        {
            var image = await FindImageAsync(id, imageId);

            if (image == null)
            {
                return NotFound(new { message = "image not found" });
            }

            image.Caption = NormalizeCaption(dto.Caption);
            await _context.SaveChangesAsync();

            return Ok(ToImageResponse(image));
        }

        [HttpDelete("{id}/images/{imageId}")]
        [Authorize]
        public async Task<IActionResult> DeleteImage(int id, int imageId)
        {
            var image = await FindImageAsync(id, imageId);

            if (image == null)
            {
                return NotFound(new { message = "image not found" });
            }

            _context.ServiceImages.Remove(image);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}/images/order")]
        [Authorize]
        public async Task<IActionResult> ReorderImages(int id, [FromBody] ReorderServiceImagesDto dto)
        {
            var findservice = await _context.Services.Include(x => x.Images).FirstOrDefaultAsync(x => x.Id == id);

            if (findservice == null)
            {
                return NotFound(new { message = "no service to show with that id!" });
            }

            var requested = dto.ImageIds ?? new List<int>();
            var current = findservice.Images.Select(i => i.Id).ToHashSet();

            if (requested.Count != current.Count || !current.SetEquals(requested))
            {
                return BadRequest(new { message = "the order must list each image of the service exactly once" });
            }

            var byId = findservice.Images.ToDictionary(i => i.Id);
            for (var position = 0; position < requested.Count; position++)
            {
                byId[requested[position]].SortOrder = position + 1;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>Only matches an image of this service: an image of another service counts as missing.</summary>
        private Task<ServiceImage?> FindImageAsync(int serviceId, int imageId) =>
            _context.ServiceImages.FirstOrDefaultAsync(x => x.Id == imageId && x.ServiceId == serviceId);

        private static string? NormalizeCaption(string? caption)
        {
            var trimmed = caption?.Trim();
            return string.IsNullOrEmpty(trimmed) ? null : trimmed;
        }

        private static ServiceResponseDto ToResponse(Services service)
        {
            return new ServiceResponseDto
            {
                Id = service.Id,
                Name = service.Name,
                Description = service.Description,
                ImageUrl = service.ImageUrl,
                Price = service.Price,
                ServiceType = service.ServiceType,
                Images = service.Images
                    .OrderBy(i => i.SortOrder)
                    .ThenBy(i => i.Id)
                    .Select(ToImageResponse)
                    .ToList(),
            };
        }

        private static ServiceImageResponseDto ToImageResponse(ServiceImage image)
        {
            return new ServiceImageResponseDto
            {
                Id = image.Id,
                Url = image.Url,
                Caption = image.Caption,
                SortOrder = image.SortOrder,
            };
        }
    }
}
