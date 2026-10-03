using BitesAndMore.API.Data;
using BitesAndMore.API.DTOs;
using BitesAndMore.API.Helpers;
using BitesAndMore.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BitesAndMore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }


        [HttpGet]

        public async Task<IActionResult> GetProducts([FromQuery] int? categoryId)
        {
            var query = _context.Products.Include(x => x.Category).AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(x => x.CategoryId == categoryId.Value);
            }

            var productlist = await query.ToListAsync();
            var whatsAppNumber = await GetWhatsAppNumberAsync();

            return Ok(productlist.Select(p => ToResponse(p, whatsAppNumber)));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            var findproduct = await _context.Products.FirstOrDefaultAsync(x => x.Name == dto.Name);

            if (findproduct != null)
            {
                return BadRequest(new { message = "that product already exist!" });
            }

            var newproduct = new Product
            {
                Name = dto.Name,
                Slug = await GenerateSlugAsync(dto.Name, null),
                Description = dto.Description,
                Price = dto.Price,
                imageUrl = dto.imageUrl,
                CategoryId = dto.CategoryId,
                isAvailable = dto.isAvailable,
                CreatedDate = DateTime.UtcNow
            };

            await _context.Products.AddAsync(newproduct);
            await _context.SaveChangesAsync();

            var response = ToResponse(newproduct, await GetWhatsAppNumberAsync());

            return CreatedAtAction(nameof(GetProductById), new { id = newproduct.Id }, response);
        }

        [HttpGet("{id}")]
        public async Task <IActionResult> GetProductById(int id)
        {
            var findProduct = await _context.Products.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id);

            if(findProduct == null) { return NotFound(new { message = $"product not found" }); }

            return Ok(ToResponse(findProduct, await GetWhatsAppNumberAsync()));
        }

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetProductBySlug(string slug)
        {
            var findProduct = await _context.Products.Include(x => x.Category).FirstOrDefaultAsync(x => x.Slug == slug);

            if (findProduct == null) { return NotFound(new { message = $"product not found" }); }

            return Ok(ToResponse(findProduct, await GetWhatsAppNumberAsync()));
        }

        [HttpGet("{id}/whatsapp")]
        public async Task<IActionResult> GetProductWhatsAppLink(int id)
        {
            var findProduct = await _context.Products.FirstOrDefaultAsync(x => x.Id == id);

            if (findProduct == null) { return NotFound(new { message = $"product not found" }); }

            var url = WhatsAppLinkBuilder.Build(await GetWhatsAppNumberAsync(), findProduct.Name);

            if (url == null) { return NotFound(new { message = "whatsapp contact is not configured" }); }

            return Ok(new { url });
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] CreateProductDto dto)
        {
            var findProduct = await _context.Products.FirstOrDefaultAsync(x => x.Id == id);

            if (findProduct == null) { return BadRequest(new { message = $"product not found" }); }

            if (findProduct.Name != dto.Name)
            {
                findProduct.Slug = await GenerateSlugAsync(dto.Name, findProduct.Id);
            }

            findProduct.Name = dto.Name;
            findProduct.Description = dto.Description;
            findProduct.Price = dto.Price;
            findProduct.imageUrl = dto.imageUrl;
            findProduct.CategoryId = dto.CategoryId;
            findProduct.isAvailable = dto.isAvailable;
            await _context.SaveChangesAsync();

            return Ok(ToResponse(findProduct, await GetWhatsAppNumberAsync()));
            
        }


        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var findProduct = await _context.Products.FirstOrDefaultAsync(x => x.Id == id);

            if (findProduct == null) { return NotFound(new { message = $"product not found" }); }

            _context.Products.Remove(findProduct);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private Task<string> GenerateSlugAsync(string? name, int? excludeProductId)
        {
            return SlugGenerator.GenerateUniqueAsync(name, candidate =>
                _context.Products.AnyAsync(x => x.Slug == candidate && x.Id != excludeProductId));
        }

        private Task<string?> GetWhatsAppNumberAsync()
        {
            return _context.BusinessInfos
                .Where(x => x.Id == BusinessInfo.SingletonId)
                .Select(x => x.WhatsAppNumber)
                .FirstOrDefaultAsync();
        }

        private static ProductResponseDto ToResponse(Product product, string? whatsAppNumber)
        {
            return new ProductResponseDto
            {
                Id = product.Id,
                Name = product.Name,
                Slug = product.Slug,
                Description = product.Description,
                Price = product.Price,
                imageUrl = product.imageUrl,
                CategoryId = product.CategoryId,
                Category = product.Category,
                isAvailable = product.isAvailable,
                CreatedDate = product.CreatedDate,
                WhatsAppUrl = WhatsAppLinkBuilder.Build(whatsAppNumber, product.Name)
            };
        }
    }
}
