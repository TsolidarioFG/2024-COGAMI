using Microsoft.Extensions.Options;
using MongoDB.Driver;
using tfg_cogami_api_backend.Models;
using tfg_cogami_api_backend.Models.Property;

namespace tfg_cogami_api_backend.Services
{
    public class PropertyService
    {
        private readonly IMongoCollection<Property> _propertyCollection;

        public PropertyService(IOptions<CogamiDatabaseSettings> cogamiDatabaseSettings)
        {
            MongoClient client = new(cogamiDatabaseSettings.Value.ConnectionString);
            IMongoDatabase database = client.GetDatabase(cogamiDatabaseSettings.Value.DatabaseName);
            _propertyCollection = database.GetCollection<Property>(cogamiDatabaseSettings.Value.Collections.Where(x => x == "Property").FirstOrDefault());
        }

        public async Task<List<Property>> GetAsync()
        {
            return await _propertyCollection.Find(_ => true).ToListAsync();
        }

        public async Task<Property> GetAsync(string id)
        {
            return await _propertyCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
        }

        public async Task<Property> GetAsync(string portal, string propertyCode)
        {
            return await _propertyCollection.Find(x => x.Portal == portal && x.PropertyCode == propertyCode).FirstOrDefaultAsync();
        }

        public async Task CreateAsync(Property property)
        {
            await _propertyCollection.InsertOneAsync(property);
        }

        public async Task UpdateAsync(string id, Property updatedProperty)
        {
            await _propertyCollection.ReplaceOneAsync(x => x.Id == id, updatedProperty);
        }

        public async Task UpdateRawData(string id, string newData)
        {
            var filter = Builders<Property>.Filter.Eq(p => p.Id, id);
            var update = Builders<Property>.Update.Set(p => p.RawData, newData);

            await _propertyCollection.UpdateOneAsync(filter, update);
        }

        public async Task DeleteAsync(string id)
        {
            await _propertyCollection.DeleteOneAsync(x => x.Id == id);
        }
    }
}
