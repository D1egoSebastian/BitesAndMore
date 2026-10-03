using BitesAndMore.API.Data;
using BitesAndMore.API.DTOs;
using Microsoft.AspNetCore.Authorization;
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
        private const int DefaultTokenLifetimeMinutes = 480;
        private const int MinPasswordLength = 8;

        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto login)
        {
            if (string.IsNullOrEmpty(login.Email) || string.IsNullOrEmpty(login.Password))
            {
                return Unauthorized();
            }

            var EmailExist = await _context.Users.FirstOrDefaultAsync(u => u.Email == login.Email);

            if(EmailExist == null)
            {
                return Unauthorized();
            }

            var verifyPassword = BCrypt.Net.BCrypt.Verify(login.Password, EmailExist.PasswordHash);

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
                expires: DateTime.UtcNow.AddMinutes(GetTokenLifetimeMinutes()),
                signingCredentials: credentials
            );

            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || string.IsNullOrEmpty(dto.CurrentPassword)
                || !BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            {
                return Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < MinPasswordLength)
            {
                return BadRequest(new { message = $"the new password must be at least {MinPasswordLength} characters long" });
            }

            if (dto.NewPassword == dto.CurrentPassword)
            {
                return BadRequest(new { message = "the new password must be different from the current one" });
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private int GetTokenLifetimeMinutes()
        {
            return int.TryParse(_configuration["Jwt:ExpiresMinutes"], out var minutes) && minutes > 0
                ? minutes
                : DefaultTokenLifetimeMinutes;
        }

    }
}
