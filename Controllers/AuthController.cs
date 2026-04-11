using BitesAndMore.API.Data;
using BitesAndMore.API.DTOs;
using BitesAndMore.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BitesAndMore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
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

           await  _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();

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

            var claims = new[]
       {
            new Claim(ClaimTypes.NameIdentifier, EmailExist.Id.ToString()),
            new Claim(ClaimTypes.Email, EmailExist.Email),
            new Claim(ClaimTypes.Name, EmailExist.Name)
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: credentials
            );

            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        }

    }
}
