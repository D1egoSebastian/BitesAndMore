using BitesAndMore.API.Data;
using BitesAndMore.API.DTOs;
using BitesAndMore.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace BitesAndMore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categorieslist = await _context.Categories.ToListAsync();

            if (categorieslist == null || categorieslist.Count == 0) {
                return NotFound(new { message = "no categories to show" });
            } else
            {
                return Ok(categorieslist);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategoy([FromBody] CreateCategoryDto dto)
        {
            var findcategoryname = await _context.Categories.FirstOrDefaultAsync(x => x.Name == dto.Name);

            if (findcategoryname != null)
            {
                return BadRequest(new { message = "that category already exist!" });
            }

            var newCategory = new Category
            {
                Name = dto.Name,
                Description = dto.Description,
            };

            _context.Categories.Add(newCategory);
            await _context.SaveChangesAsync();

            return Ok(new CategoryResponseDto
            {
                Name = newCategory.Name,
                Description = newCategory.Description,
            });
        }

        [HttpGet("{id}")]
        public async Task <IActionResult> GetCategoryById (int id)
        {
            var categoryfinder = await _context.Categories.FirstOrDefaultAsync(x => x.Id == id);

            if(categoryfinder != null)
            {
                return Ok(categoryfinder);
            }

            return NotFound(new { message = "that category dont exist!" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CreateCategoryDto dto)
        {
            var categoryfinder = await _context.Categories.FirstOrDefaultAsync(x => x.Id == id);

            if (categoryfinder == null)
            {
                return NotFound(new {message = "that category dont exist!"});
            }

            categoryfinder.Name = dto.Name;
            categoryfinder.Description = dto.Description;

            await _context.SaveChangesAsync();

            return Ok(new CategoryResponseDto
            {
                Name = categoryfinder.Name,
                Description = categoryfinder.Description,
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var categoryfinder = await _context.Categories.FirstOrDefaultAsync(x => x.Id == id);

            if (categoryfinder != null)
            {
                _context.Categories.Remove(categoryfinder);
                await _context.SaveChangesAsync();

            }

            return NotFound(new { message = "that category dont exist!" });
        }

    }
}
