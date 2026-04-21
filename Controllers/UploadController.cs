using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BitesAndMore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly ICloudinary _cloudinary;

        public UploadController(IConfiguration configuration)
        {
            var account = new Account(

                configuration["Cloudinary:CloudName"],
                configuration["Cloudinary:ApiKey"],
                configuration["Cloudinary:ApiSecret"]

                );

            _cloudinary = new Cloudinary( account );
        }

        [HttpPost]
        [Authorize]

        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if(file == null || file.Length == 0)
            {
                return BadRequest(new { message = "no file provided" });
            }

            using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "Bitesandmore"
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if(result.Error != null)
            {
                return BadRequest(new { message = result.Error.Message });
            }

            return Ok(new {url = result.SecureUrl.ToString()});
        }
    }
}
