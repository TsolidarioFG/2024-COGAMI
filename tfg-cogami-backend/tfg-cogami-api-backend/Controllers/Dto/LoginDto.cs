using System.ComponentModel.DataAnnotations;

namespace tfg_cogami_api_backend.Controllers.Dto
{
    public class LoginDto
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
