using tfg_cogami_api_backend.Models.User;

namespace tfg_cogami_api_backend.Controllers.Dto
{
    public class AuthenticatedUserDto
    {
        public string JwtToken { get; set; }
        public User UserInfo { get; set; }
    }
}
