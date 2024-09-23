using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using tfg_cogami_api_backend.Models.Location;
using tfg_cogami_api_backend.Services;

namespace tfg_cogami_api_backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("cogami/locations")]
    public class LocationController : ControllerBase
    {
        private readonly LocationService _locationService;

        public LocationController(LocationService locationService)
        {
            _locationService = locationService;
        }

        [HttpGet]
        public async Task<List<Location>> Get() =>
            await _locationService.GetAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Location>> Get(string id)
        {
            var location = await _locationService.GetAsync(id);

            if (location is null)
            {
                return NotFound();
            }

            return location;
        }
        [HttpGet("{portal:maxlength(9)}")]
        public async Task<ActionResult<List<Location>>> GetByPortal(string portal)
        {
            var locations = _locationService.GetLocationsByPortal(portal);
            if (locations is null || locations.Result.Count == 0)
            {
                return NotFound();
            }
            return await _locationService.GetLocationsByPortal(portal);
        }
    }
}
