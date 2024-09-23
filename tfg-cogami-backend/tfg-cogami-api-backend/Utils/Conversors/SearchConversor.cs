using tfg_cogami_api_backend.Controllers.Dto;
using tfg_cogami_api_backend.Models.Search;

namespace tfg_cogami_api_backend.Utils.Conversors
{
    public static class SearchConversor
    {
        public static Search CreateSearchDtoToSearch(CreateSearchDto dto)
        {
            return new Search
            {
                Portal = dto.Portal,
                Operation = dto.Operation,
                PropertyType = dto.PropertyType,
                PriceRange = dto.PriceRange,
                SizeRange = dto.SizeRange,
                Bathrooms = dto.Bathrooms,
                Bedrooms = dto.Bedrooms,
                Characteristics = dto.Characteristics,
                PropertiesPropertyCode = dto.PropertiesPropertyCode,
                UserFk = dto.UserFk
            };
        }
    }
}
