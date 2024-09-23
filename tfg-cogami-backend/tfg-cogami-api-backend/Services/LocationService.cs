using Microsoft.Extensions.Options;
using MongoDB.Driver;
using tfg_cogami_api_backend.Models;
using tfg_cogami_api_backend.Models.Location;

namespace tfg_cogami_api_backend.Services
{
    public class LocationService
    {
        private readonly IMongoCollection<Location> _locationCollection;

        public LocationService(IOptions<CogamiDatabaseSettings> cogamiDatabaseSettings)
        {
            var mongoClient = new MongoClient(cogamiDatabaseSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(cogamiDatabaseSettings.Value.DatabaseName);

            _locationCollection = mongoDatabase.GetCollection<Location>(cogamiDatabaseSettings.Value.Collections.Where(x => x == "Location").FirstOrDefault());
        }

        public async Task<List<Location>> GetAsync() =>
        await _locationCollection.Find(_ => true).ToListAsync();

        public async Task<Location> GetAsync(string id)
        {
            return await _locationCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Location>> GetLocationsByPortal(string portal)
        {
            return await _locationCollection.Find(x => x.Portal == portal).ToListAsync();
        }
    }
}
