using tfg_cogami_api_backend.Models.Location;
using tfg_cogami_api_backend.Models.Search;

namespace tfg_cogami_api_backend.Controllers.Dto
{
    public class CreateSearchDto
    {
        public string Portal { get; set; }
        public string Operation { get; set; }
        public string PropertyType { get; set; }
        public decimal[] PriceRange { get; set; }
        public decimal[] SizeRange { get; set; }
        public int Bathrooms { get; set; }
        public int Bedrooms { get; set; }
        public SearchCharacteristics Characteristics { get; set; }
        public string LocationDbId { get; set; }
        public Coordinates Coordinates { get; set; }
        public string[] PropertiesPropertyCode { get; set; }
        public string UserFk { get; set; }
    }
}
