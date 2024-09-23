using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using tfg_cogami_api_backend.Controllers.Dto;
using tfg_cogami_api_backend.Models.Category;
using tfg_cogami_api_backend.Models.User;
using tfg_cogami_api_backend.Services;
using tfg_cogami_api_backend.Utils;
using tfg_cogami_api_backend.Utils.Conversors;

namespace tfg_cogami_api_backend.Controllers
{
    [ApiController]
    [Route("cogami/authentication")]
    public class AuthenticationController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IOptions<JwtConfiguration> _jwtConfiguration;
        private static readonly TimeSpan TokenLifetime = TimeSpan.FromDays(15);

        public AuthenticationController(UserService userService, IOptions<JwtConfiguration> jwtConfiguration)
        {
            _userService = userService;
            _jwtConfiguration = jwtConfiguration;
        }

        [HttpGet]
        public async Task<List<User>> GetAll() =>
            await _userService.GetAync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<User>> GetById(string id)
        {
            User _user = await _userService.GetAsync(id);
            return _user is null ? NotFound() : _user;

        }

        [HttpPost("signUp")]
        public async Task<IActionResult> SignUp([FromBody] SignUpUserDto userDto)
        {

            if (await _userService.GetAsyncByEmail(userDto.Email) is not null) 
            { 
                return Conflict(new ErrorDto { ErrorMessage = "Ya existe el usuario con el email: " + userDto.Email });
            }

            if (await _userService.GetAsyncByUsername(userDto.Username) is not null) 
            {
                return Conflict(new ErrorDto { ErrorMessage = "Usuario ya existe con el nombre de usuario " + userDto.Username });
            }

            User newUser = UserConversor.CreateUserFromSignUpDto(userDto);

            await _userService.CreateAsync(newUser);

            return Ok(UserConversor.CreateAuthenticatedUserDto(newUser, GenerateJwt(newUser.Email)));
            
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            User user = await _userService.GetAsyncByEmail(login.Email);

            if (user is null) { return NotFound(new ErrorDto { ErrorMessage = "Usuario no encontrado"}); }

            if (!PasswordService.VerifyPasswd(login.Password, user.Password)) { return BadRequest(new ErrorDto { ErrorMessage = "Credenciales incorrectos" }); }

            return Ok(UserConversor.CreateAuthenticatedUserDto(user, GenerateJwt(user.Email)));
        }

        [HttpPut("changePassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            User user = await _userService.GetAsyncByEmail(changePasswordDto.Email);

            if (user is null) { return NotFound(new ErrorDto { ErrorMessage = "Usuario no encontrado" }); }

            if (changePasswordDto.NewPassword != changePasswordDto.NewConfirmPassword) { return BadRequest(new ErrorDto { ErrorMessage = "Contraseñas no coinciden" }); }

            user.Password = PasswordService.HashPasswd(changePasswordDto.NewPassword);

            await _userService.UpdateAsync(user.Id, user);

            return Ok();

        }

        private string GenerateJwt(string email)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Convert.FromBase64String(_jwtConfiguration.Value.Key);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(JwtRegisteredClaimNames.Sub, email),
                new(JwtRegisteredClaimNames.Email, email)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.Add(TokenLifetime),
                Issuer = _jwtConfiguration.Value.Issuer,
                Audience = _jwtConfiguration.Value.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            var jwt = tokenHandler.WriteToken(token);
            return jwt;
        }
    }
}
