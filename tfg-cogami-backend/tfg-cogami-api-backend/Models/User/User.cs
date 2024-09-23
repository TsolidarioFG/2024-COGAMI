using MongoDB.Bson.Serialization.Attributes;
using tfg_cogami_api_backend.Models.Property;

namespace tfg_cogami_api_backend.Models.User
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string Id { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        [BsonIgnoreIfDefault]
        public FollowedProperty[] FollowedProperties { get; set; }
        [BsonIgnoreIfDefault]
        public NotInterestedProperty[] NotInterestedProperties { get; set; }
    }
}
