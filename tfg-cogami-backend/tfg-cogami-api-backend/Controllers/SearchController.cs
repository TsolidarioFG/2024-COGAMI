using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using tfg_cogami_api_backend.Controllers.Dto;
using tfg_cogami_api_backend.Models.Location;
using tfg_cogami_api_backend.Models.Property;
using tfg_cogami_api_backend.Models.Search;
using tfg_cogami_api_backend.Services;
using tfg_cogami_api_backend.Utils;
using tfg_cogami_api_backend.Utils.Conversors;

namespace tfg_cogami_api_backend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("cogami/search")]
    public class SearchController : ControllerBase
    {
        private readonly SearchService _searchService;
        private readonly PropertyService _propertyService;
        private readonly LocationService _locationService;
        private readonly UserService _userService;
        private readonly CategoryService _categoryService;

        public SearchController(SearchService searchService, PropertyService propertyService, LocationService locationService, UserService userService, CategoryService categoryService)
        {
            _searchService = searchService;
            _propertyService = propertyService;
            _locationService = locationService;
            _userService = userService;
            _categoryService = categoryService;
        }

        #region Search

        [HttpGet]
        public async Task<List<Search>> Get() =>
        await _searchService.GetAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Search>> Get(string id)
        {
            var search = await _searchService.GetAsync(id);

            if (search is null)
            {
                return NotFound();
            }

            return search;
        }

        [HttpGet("userSearch/{userId:length(24)}")]
        public async Task<ActionResult<List<Search>>> GetSearchByUser(string userId)
        {
            var user = _userService.GetAsync(userId);
            if (user is null)
            {
                return NotFound();
            }

            return await _searchService.GetByUser(userId);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSearch([FromBody] CreateSearchDto searchDto)
        {
            Search search = SearchConversor.CreateSearchDtoToSearch(searchDto);
            if (searchDto.LocationDbId == null)
            {
                search.Coordinates = searchDto.Coordinates;
            } else
            {
                Location location = await _locationService.GetAsync(searchDto.LocationDbId);
                if (location is null)
                {
                    return NotFound(new ErrorDto { ErrorMessage = "No se ha encontrado la localización" });
                }
                search.Location = location;
            }

            await _searchService.CreateAsync(search);

            return CreatedAtAction(nameof(Get), new { id = search.Id }, search);
        }

        [HttpPut("flag/{id:length(24)}/{flagValue:bool}")]
        public async Task FlagSearch(string id, bool flagValue)
        {
            await _searchService.FlagSearch(id, flagValue);
        }

        [HttpDelete("{id:length(24)}")]
        public async Task DeleteSearch(string id)
        {
            await _searchService.RemoveAsync(id);
        }

        [HttpPut("addPropertyCodes/{id:length(24)}")]
        public async Task<IActionResult> AddPropertyCodes(string id, [FromBody()] AddPropertyCodesDto dto)
        {
            var _ = await _searchService.GetAsync(id);
            if (_ is null) { return NotFound(new ErrorDto { ErrorMessage = "Búsqueda no encontrada para añadir propiedad" }); }

            foreach (string propertyCode in dto.PropertyCodes)
            {
                await _searchService.AddPropertyIntoSearch(id, propertyCode);
            }

            return NoContent();
        }

        #endregion

        #region Property

        [HttpGet("property/{id:length(24)}")]
        public async Task<ActionResult<Property>> GetPropertyById(string id)
        {
            var property = await _propertyService.GetAsync(id);

            if (property is null) { return NotFound(); }

            return property;
        }

        [HttpPost("property")]
        public async Task<ActionResult<Property>> CreateProperty([FromBody] CreatePropertyDto newProperty)
        {
            // Devolver el id generado por la base de datos para almacenarlo en la lista de busquedas
            Property foundProperty = await _propertyService.GetAsync(newProperty.Portal, newProperty.PropertyCode);

            if (foundProperty != null)
            {
                // Comprobar si la propiedad tiene seguiemiento de algun usuario para modificar las notificaciones
                // Modificar la informacion de la propiedad y si cambia algo poder mandar la noti en caso de que tenga seguiemiento
                await _propertyService.UpdateRawData(foundProperty.Id!, newProperty.RawData);
                return Ok(foundProperty);
            } else
            {
                // Si es nueva simplemente se añade y listo
                Property property = PropertyConversor.CreatePropertyDtoToProperty(newProperty);
                await _propertyService.CreateAsync(property);
                return Ok(property);
            }

        }


        [HttpGet("property/{portal}/{propertyCode}")]
        public async Task<ActionResult<Property>> GetPropertyByPortalAndPropertyCode(string portal, string propertyCode)
        {
            Property foundProperty = await _propertyService.GetAsync(portal, propertyCode);
            return foundProperty == null ? NotFound() : foundProperty;
        }


        [HttpPut("property/favorite/{userId:length(24)}/{propertyId:length(24)}/{categoryId:length(24)}")]
        public async Task<IActionResult> FavoriteProperty(string userId, string propertyId, string categoryId)
        {
            var user = await _userService.GetAsync(userId);
            var property = await _propertyService.GetAsync(propertyId);
            var category = await _categoryService.GetAsync(categoryId);

            if (user is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Usuario no encontrado" });
            }

            if (property is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Vivienda no encontrada" });
            }

            if (category is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Categoría no encontrada" });
            }

            await _userService.FavoriteProperty(userId, new FollowedProperty { Id = propertyId, Comment = "", CategoryId = categoryId, Notifications = 0 });

            return Ok();
        }

        [HttpPut("property/unfavorite/{userId:length(24)}")]
        public async Task<IActionResult> UnfavoriteProperty(string userId, [FromBody] FollowedProperty followedProperty)
        {
            var user = await _userService.GetAsync(userId);
            var property = await _propertyService.GetAsync(followedProperty.Id);
            var category = await _categoryService.GetAsync(followedProperty.CategoryId);

            if (user is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Usuario no encontrado" });
            }

            if (property is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Vivienda no encontrada" });
            }

            if (category is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Categoría no encontrada" });
            }

            await _userService.UnfavoriteProperty(userId, followedProperty);

            return Ok();


        }

        [HttpPut("property/markNotInterested/{userId:length(24)}")]
        public async Task<IActionResult> MarkNotInterested(string userId, [FromBody] NotInterestedProperty notInterestedProperty)
        {
            var user = await _userService.GetAsync(userId);

            if (user is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Usuario no encontrado" });
            }

            await _userService.MarkAsNotInterested(userId, notInterestedProperty);
            return Ok();
        }

        [HttpPut("property/unmarkNotInterested/{userId:length(24)}")]
        public async Task<IActionResult> UnmarkNotInterested(string userId, [FromBody] NotInterestedProperty notInterestedProperty)
        {
            var user = await _userService.GetAsync(userId);

            if (user is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Usuario no encontrado" });
            }

            await _userService.UnmarkAsNotInterested(userId, notInterestedProperty);
            return Ok();
        }

        [HttpGet("property/favorite/{userId:length(24)}")]
        public async Task<IActionResult> GetUserFavoriteProperties(string userId)
        {
            var user = await _userService.GetAsync(userId);

            if (user is null) { return NotFound(new ErrorDto { ErrorMessage = "Usuario no encontrado" }); }

            return Ok(user.FollowedProperties);
        }

        [HttpGet("property/notInterested/{userId:length(24)}")]
        public async Task<IActionResult> GetUserNotInterestedProperties(string userId)
        {
            var user = await _userService.GetAsync(userId);

            if (user is null) { return NotFound(new ErrorDto { ErrorMessage = "Usuario no encontrado" }); }

            return Ok(user.NotInterestedProperties);
        }

        [HttpPut("property/favorite/comment/{userId:length(24)}")]
        public async Task<IActionResult> CommentFavoriteProperty(string userId, [FromBody] FollowedProperty followedProperty)
        {
            var user = await _userService.GetAsync(userId);
            var property = await _propertyService.GetAsync(followedProperty.Id);
            var category = await _categoryService.GetAsync(followedProperty.CategoryId);

            if (user is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Usuario no encontrado" });
            }

            if (property is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Vivienda no encontrada" });
            }

            if (category is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Categoría no encontrada" });
            }

            await _userService.EditCommentFavorite(userId, followedProperty.Id, followedProperty.Comment);

            return Ok();
        }

        [HttpPut("property/favorite/notifications/{userId:length(24)}")]
        public async Task<IActionResult> UpdateFavoritePropertyNotifications(string userId, [FromBody] FollowedProperty followedProperty)
        {
            var user = await _userService.GetAsync(userId);
            var property = await _propertyService.GetAsync(followedProperty.Id);
            var category = await _categoryService.GetAsync(followedProperty.CategoryId);

            if (user is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Usuario no encontrado" });
            }

            if (property is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Vivienda no encontrada" });
            }

            if (category is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Categoría no encontrada" });
            }

            await _userService.UpdateNotificationsFavorite(userId, followedProperty.Id, followedProperty.Notifications);
            await _userService.UpdateNotificationsMessage(userId, followedProperty.Id, followedProperty.NotificationMessage);

            return Ok();

        }

        [HttpPut("property/favorite/updateCategory/{userId:length(24)}")]
        public async Task<IActionResult> UpdateFavoritePropertyCategory(string userId, [FromBody] FollowedProperty followedProperty)
        {
            var user = await _userService.GetAsync(userId);
            var property = await _propertyService.GetAsync(followedProperty.Id);
            var category = await _categoryService.GetAsync(followedProperty.CategoryId);

            if (user is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Usuario no encontrado" });
            }

            if (property is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Vivienda no encontrada" });
            }

            if (category is null)
            {
                return NotFound(new ErrorDto { ErrorMessage = "Categoría no encontrada" });
            }

            await _userService.UpdateFavoritePropertyCategory(userId, followedProperty.Id, followedProperty.CategoryId);

            return Ok();
        }

        #endregion
    }
}
