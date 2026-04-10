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
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var checkemail = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if(checkemail != null)
            {
                return BadRequest(new { message = "that email already exist in db, try login!" });
            }

            var passwordHashed = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash);
            var newUser = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = passwordHashed
            };

            return Ok(new UserResponseDto
            {
                Name = newUser.Name,
                Email = newUser.Email,
                PasswordHash = newUser.PasswordHash
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto login)
        {
            var EmailExist = await _context.Users.FirstOrDefaultAsync(u => u.Email == login.Email);

            if(EmailExist == null)
            {
                return Unauthorized();
            }

            var verifyPassword = BCrypt.Net.BCrypt.Verify(login.PasswordHash, EmailExist.PasswordHash);

            if (!verifyPassword)
            {
                return Unauthorized();
            }

            return Ok(new UserResponseDto
            {
                Name = EmailExist.Name,
                Email = EmailExist.Email,
                PasswordHash = EmailExist.PasswordHash
            });
        }

    }
}
