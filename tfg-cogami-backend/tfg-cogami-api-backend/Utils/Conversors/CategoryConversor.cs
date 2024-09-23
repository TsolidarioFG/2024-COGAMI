using tfg_cogami_api_backend.Controllers.Dto;
using tfg_cogami_api_backend.Models.Category;

namespace tfg_cogami_api_backend.Utils.Conversors
{
    public static class CategoryConversor
    {
        public static Category CategoryDtoToCategory(CreateCategoryDto dto)
        {
            return new Category
            {
                Name = dto.Name,
                CreationDate = DateTime.Now,
                UserFk = dto.UserFk
            };
        }
    }
}
