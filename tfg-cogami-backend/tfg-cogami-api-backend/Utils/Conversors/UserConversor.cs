using tfg_cogami_api_backend.Controllers.Dto;
using tfg_cogami_api_backend.Models.User;

namespace tfg_cogami_api_backend.Utils.Conversors
{
    public static class UserConversor
    {
        public static User CreateUserFromSignUpDto(SignUpUserDto signUpUserDto)
        {
            return new User
            {
                Name = signUpUserDto.Name,
                LastName = signUpUserDto.LastName,
                Email = signUpUserDto.Email,
                Password = PasswordService.HashPasswd(signUpUserDto.Password),
                Username = signUpUserDto.Username
            };
        }

        public static AuthenticatedUserDto CreateAuthenticatedUserDto(User user, string jwt)
        {
            return new AuthenticatedUserDto
            {
                JwtToken = jwt,
                UserInfo = user
            };
        }

    }
}
