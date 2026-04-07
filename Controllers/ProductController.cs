using BitesAndMore.API.Data;
using BitesAndMore.API.DTOs;
using BitesAndMore.API.Models;
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

        public async Task<IActionResult> GetProducts()
        {
            var productlist = await _context.Products.ToListAsync();

            if(productlist == null)
            {
                return NotFound(new { message = "no products to show!" });
            } 

            return Ok(productlist);
        }

        [HttpPost]
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
                Description = dto.Description,
                Price = dto.Price,
                imageUrl = dto.imageUrl,
                CategoryId = dto.CategoryId,
                isAvailable = dto.isAvailable,
                CreatedDate = DateTime.UtcNow
            };

            await _context.Products.AddAsync(newproduct);
            await _context.SaveChangesAsync();

            return Ok(new ProductResponseDto
            {
                Name = newproduct.Name,
                Description= newproduct.Description,
                Price= newproduct.Price,
                imageUrl= newproduct.imageUrl,
                CategoryId = newproduct.CategoryId,
                isAvailable = newproduct.isAvailable,
            });
        }

        [HttpGet("{id}")]
        public async Task <IActionResult> GetProductById(int id)
        {
            var findProduct = await _context.Products.FirstOrDefaultAsync(x => x.Id == id);

            if(findProduct == null) { return NotFound(new { message = $"product not found" }); }

            return Ok(findProduct);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] CreateProductDto dto)
        {
            var findProduct = await _context.Products.FirstOrDefaultAsync(x => x.Id == id);

            if (findProduct == null) { return BadRequest(new { message = $"product not found" }); }


            findProduct.Name = dto.Name;
            findProduct.Description = dto.Description;
            findProduct.Price = dto.Price;
            findProduct.imageUrl = dto.imageUrl;
            findProduct.CategoryId = dto.CategoryId;
            findProduct.isAvailable = dto.isAvailable;
            await _context.SaveChangesAsync();

            return Ok(new ProductResponseDto
            {
                Name = findProduct.Name,
                Description = findProduct.Description,
                Price = findProduct.Price,
                imageUrl = findProduct.imageUrl,
                CategoryId = findProduct.CategoryId,
                isAvailable = findProduct.isAvailable,
            });
            
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var findProduct = await _context.Products.FirstOrDefaultAsync(x => x.Id == id);

            if (findProduct == null) { return NotFound(new { message = $"product not found" }); }

            _context.Products.Remove(findProduct);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
