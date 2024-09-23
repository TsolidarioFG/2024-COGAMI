namespace tfg_cogami_api_backend.Models
{
    public class CogamiDatabaseSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string[] Collections { get; set; } = null!;
    }
}
