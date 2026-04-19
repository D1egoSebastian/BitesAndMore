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
        private readonly AppDbContext _context;

        public ServiceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetServices()
        {
            var services = await _context.Services.ToListAsync();

            if (services == null || services.Count == 0)
            {
                return NotFound(new { message = "no services found!" });
            }

            return Ok(services);
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
            };

            _context.Services.Add(newService);
            await _context.SaveChangesAsync();

            return Ok(new ServiceResponseDto
            {
                Name = newService.Name,
                Description = newService.Description,
                ImageUrl = newService.ImageUrl,
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetServiceById(int id)
        {
            var findservice = await _context.Services.FirstOrDefaultAsync(x => x.Id == id);

            if (findservice == null)
            {
                return NotFound(new { message = "no service to show with that id!" });
            }

            return Ok(findservice);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateService(int id, [FromBody] CreateServiceDto dto)
        {
            var findservice = await _context.Services.FirstOrDefaultAsync(x => x.Id == id);

            if (findservice == null)
            {
                return NotFound(new { message = "no service to show with that id!" });
            }

            findservice.Name = dto.Name;
            findservice.Description = dto.Description;
            findservice.ImageUrl = dto.ImageUrl;

            await _context.SaveChangesAsync();

            return Ok(new ServiceResponseDto
            {
                Name = findservice.Name,
                Description = findservice.Description,
                ImageUrl = findservice.ImageUrl,
            });
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
    }
}
