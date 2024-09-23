using BCrypt.Net;

namespace tfg_cogami_api_backend.Utils
{
    public static class PasswordService
    {
        public static string HashPasswd(string passwd)
        {
            return BCrypt.Net.BCrypt.HashPassword(passwd);
        }

        public static bool VerifyPasswd(string passwd, string hashedPasswd)
        {
            return BCrypt.Net.BCrypt.Verify(passwd, hashedPasswd);
        }
    }
}
