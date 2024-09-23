using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using tfg_cogami_api_backend.Models.Location;

namespace tfg_cogami_api_backend.Models.Search
{
    public class Search
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public DateTime CreationDate { get; set; }
        [BsonIgnoreIfDefault]
        public bool Flagged { get; set; }
        [BsonIgnoreIfDefault]
        public bool Removed { get; set; }
        public string Portal { get; set; }
        public string Operation { get; set; }
        public string PropertyType { get; set; }
        public decimal[] PriceRange { get; set; }
        public decimal[] SizeRange { get; set; }
        public int Bathrooms { get; set; }
        public int Bedrooms { get; set; }
        public SearchCharacteristics Characteristics { get; set; }
        [BsonIgnoreIfDefault]
        public Location.Location Location { get; set; }
        [BsonIgnoreIfDefault]
        public Coordinates Coordinates { get; set; }
        public string[] PropertiesPropertyCode { get; set; }
        [BsonIgnoreIfDefault]
        public string? FkCategoryId { get; set; }
        public string UserFk {  get; set; }
    }
}
