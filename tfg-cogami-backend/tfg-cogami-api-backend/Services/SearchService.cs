using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using tfg_cogami_api_backend.Models;
using tfg_cogami_api_backend.Models.Search;

namespace tfg_cogami_api_backend.Services
{
    public class SearchService
    {
        private readonly IMongoCollection<Search> _searchCollection;

        public SearchService(IOptions<CogamiDatabaseSettings> cogamiDatabaseSettings)
        {
            var mongoClient = new MongoClient(cogamiDatabaseSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(cogamiDatabaseSettings.Value.DatabaseName);

            _searchCollection = mongoDatabase.GetCollection<Search>(cogamiDatabaseSettings.Value.Collections.Where(x => x == "Search").FirstOrDefault());
        }

        public async Task<List<Search>> GetAsync() =>
            await _searchCollection.Find(_ => true).Sort(Builders<Search>.Sort.Ascending(search => search.CreationDate)).ToListAsync();

        public async Task<Search?> GetAsync(string id) =>
            await _searchCollection.Find(x => x.Id.ToString() == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Search newSearch)
        {
            newSearch.CreationDate = DateTime.Now;
            await _searchCollection.InsertOneAsync(newSearch);
        }

        public async Task UpdateAsync(string id, Search updatedSearch) =>
            await _searchCollection.ReplaceOneAsync(x => x.Id.ToString() == id, updatedSearch);

        public async Task AddPropertyIntoSearch(string id, string propertyCode)
        {
            var filter = Builders<Search>.Filter.Eq(search => search.Id, id);
            var update = Builders<Search>.Update.Push(search => search.PropertiesPropertyCode, propertyCode);
            await _searchCollection.UpdateOneAsync(filter, update);
        }

        public async Task FlagSearch(string id, bool flag)
        {
            var filter = Builders<Search>.Filter.Eq(search => search.Id, id);
            var update = Builders<Search>.Update.Set(search => search.Flagged, flag);
            await _searchCollection.UpdateOneAsync(filter, update);
        }

        public async Task<List<Search>> GetByUser(string userId) =>
            await _searchCollection.Find(x => x.UserFk == userId).SortByDescending(search => search.CreationDate).ToListAsync();

        public async Task RemoveAsync(string id) =>
            await _searchCollection.DeleteOneAsync(x => x.Id.ToString() == id);

        public async Task<List<Search>> GetSearchesByCategory(string categoryId)
        {
            return await _searchCollection.Find(search => search.FkCategoryId == categoryId).ToListAsync();
        }
    }
}
