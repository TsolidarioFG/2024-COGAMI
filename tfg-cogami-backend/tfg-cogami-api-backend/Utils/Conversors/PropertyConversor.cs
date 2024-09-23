using tfg_cogami_api_backend.Controllers.Dto;
using tfg_cogami_api_backend.Models.Property;

namespace tfg_cogami_api_backend.Utils.Conversors
{
    public static class PropertyConversor
    {
        public static Property CreatePropertyDtoToProperty(CreatePropertyDto dto)
        {
            return new Property
            {
                Portal = dto.Portal,
                PropertyCode = dto.PropertyCode,
                PortalLink = dto.PortalLink,
                RawData = dto.RawData
            };
        }
    }
}
