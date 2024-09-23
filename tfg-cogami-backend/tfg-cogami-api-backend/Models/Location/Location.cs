using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace tfg_cogami_api_backend.Models.Location
{
    public class Location
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [BsonRequired]
        public string Name { get; set; }
        [BsonRequired]
        public string Portal { get; set; }
        [BsonRequired]
        public string LocationId { get; set; }
        [BsonRequired]
        public bool Divisible { get; set; }
        [BsonRequired]
        public string SubTypeText { get; set; }
    }
}
