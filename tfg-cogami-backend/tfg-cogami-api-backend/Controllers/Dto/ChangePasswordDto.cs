namespace tfg_cogami_api_backend.Controllers.Dto
{
    public class ChangePasswordDto
    {
        public string Email { get; set; }
        public string NewPassword { get; set; }
        public string NewConfirmPassword { get; set; }
    }
}
