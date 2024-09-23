using MongoDB.Bson.Serialization.Attributes;

namespace tfg_cogami_api_backend.Models.Property
{
    public class Property
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Portal { get; set; }
        public string PropertyCode { get; set; }
        public string PortalLink { get; set; }
        public string RawData { get; set; }
        // true si esta marcada para ser eliminada, es decir tras ejecutar el script de seguimiento en caso de que de un 404 se pone a true, en la siguiente ejecucion del script se elimina
        [BsonIgnoreIfDefault]
        public bool Delete { get; set; }
    }
}