using System.ComponentModel.DataAnnotations;

namespace tfg_cogami_api_backend.Controllers.Dto
{
    public class SignUpUserDto
    {
        [Required]
        public string Name { get; set; }
        public string LastName { get; set; }
        [Required]
        public string Username { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
