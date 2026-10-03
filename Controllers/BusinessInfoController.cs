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
    public class BusinessInfoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BusinessInfoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetBusinessInfo()
        {
            var info = await _context.BusinessInfos.FirstOrDefaultAsync(x => x.Id == BusinessInfo.SingletonId);

            if (info == null)
            {
                return NotFound(new { message = "business info is not configured yet!" });
            }

            return Ok(ToDto(info));
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpsertBusinessInfo([FromBody] BusinessInfoDto dto)
        {
            var info = await _context.BusinessInfos.FirstOrDefaultAsync(x => x.Id == BusinessInfo.SingletonId);

            if (info == null)
            {
                info = new BusinessInfo { Id = BusinessInfo.SingletonId };
                _context.BusinessInfos.Add(info);
            }

            info.BusinessName = dto.BusinessName;
            info.Mission = dto.Mission;
            info.Vision = dto.Vision;
            info.PhoneNumber = dto.PhoneNumber;
            info.WhatsAppNumber = dto.WhatsAppNumber;
            info.Address = dto.Address;
            info.Instagram = dto.Instagram;
            info.Facebook = dto.Facebook;

            await _context.SaveChangesAsync();

            return Ok(ToDto(info));
        }

        private static BusinessInfoDto ToDto(BusinessInfo info)
        {
            return new BusinessInfoDto
            {
                BusinessName = info.BusinessName,
                Mission = info.Mission,
                Vision = info.Vision,
                PhoneNumber = info.PhoneNumber,
                WhatsAppNumber = info.WhatsAppNumber,
                Address = info.Address,
                Instagram = info.Instagram,
                Facebook = info.Facebook
            };
        }
    }
}
