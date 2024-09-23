using MongoDB.Bson.Serialization.Attributes;

namespace tfg_cogami_api_backend.Models.Category
{
    public class Category
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Name { get; set; }
        public DateTime CreationDate { get; set; }
        public string UserFk { get; set; }
    }
}
