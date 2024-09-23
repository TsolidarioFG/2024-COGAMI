using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using tfg_cogami_api_backend.Controllers.Dto;
using tfg_cogami_api_backend.Models.Category;
using tfg_cogami_api_backend.Services;
using tfg_cogami_api_backend.Utils.Conversors;
using tfg_cogami_api_backend.Utils;

namespace tfg_cogami_api_backend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("cogami/categories")]
    public class CategoryController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly CategoryService _categoryService;
        private readonly SearchService _searchService;

        public CategoryController(UserService userService, CategoryService categoryService, SearchService searchService)
        {
            _userService = userService;
            _categoryService = categoryService;
            _searchService = searchService;
        }

        [HttpGet]
        public async Task<List<Category>> Get() =>
            await _categoryService.GetAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Category>> Get(string id)
        {
            var _category = await _categoryService.GetAsync(id);
            if (_category is null)
            {
                return NotFound();
            }

            return _category;
        }

        [HttpGet("byUser/{userId:length(24)}")]
        public async Task<ActionResult<List<Category>>> GetUserCreatedCategories(string userId)
        {
            return await _categoryService.GetUserCreatedCategories(userId);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            Category category = CategoryConversor.CategoryDtoToCategory(dto);

            var _category = await _categoryService.GetCategoryByNameAndUserFk(category.Name, category.UserFk);

            if (_category is not null)
            {
                return BadRequest(new ErrorDto { ErrorMessage = "Ya existe una categoría con ese nombre" });
            }
            
            await _categoryService.CreateAsync(category);

            return CreatedAtAction(nameof(Get), new { id = category.Id }, category);
        }

        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, [FromBody] CreateCategoryDto dto)
        {
            var category = await _categoryService.GetAsync(id);
            if (category is null)
            {
                return NotFound();
            }

            category.Name = dto.Name;
            await _categoryService.UpdateAsync(id, category);

            return Ok();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var category = await _categoryService.GetAsync(id);
            if (category is null)
            {
                return NotFound();
            }

            var searches = await _searchService.GetSearchesByCategory(id);
            
            var user = await _userService.GetAsync(category.UserFk);

            if (user is null)
            {
                return NotFound();
            }

            var followedProperties = user.FollowedProperties.Where(fp => fp.CategoryId == category.Id).Select(fp => fp.Id).ToList();

            if (searches.Count != 0 || followedProperties.Count != 0)
            {
                return Conflict(new ErrorDto { ErrorMessage= "Esta categoría está asociada y no se puede eliminar"});
            }

            await _categoryService.RemoveAsync(id);
            return Ok();
        }

        [HttpPut("addCategoryToSearch")]
        public async Task<IActionResult> AddCategoryToSearch([FromBody] AddCategoryToSearchOrPropertyDto dto)
        {
            var search = await _searchService.GetAsync(dto.Id);

            if (search is null)
            {
                return NotFound();
            }

            search.FkCategoryId = dto.CategoryId;

            await _searchService.UpdateAsync(search.Id!, search);

            return Ok();
        }
    }
}
