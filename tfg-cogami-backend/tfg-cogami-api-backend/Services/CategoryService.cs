using Microsoft.Extensions.Options;
using MongoDB.Driver;
using tfg_cogami_api_backend.Models;
using tfg_cogami_api_backend.Models.Category;
using tfg_cogami_api_backend.Models.Search;

namespace tfg_cogami_api_backend.Services
{
    public class CategoryService
    {
        private readonly IMongoCollection<Category> _categoryCollection;

        public CategoryService(IOptions<CogamiDatabaseSettings> cogamiDatabaseSettings)
        {
            var mongoClient = new MongoClient(cogamiDatabaseSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(cogamiDatabaseSettings.Value.DatabaseName);

            _categoryCollection = mongoDatabase.GetCollection<Category>(cogamiDatabaseSettings.Value.Collections.Where(x => x == "Category").FirstOrDefault());
        }

        public async Task<List<Category>> GetAsync() =>
            await _categoryCollection.Find(_ => true).ToListAsync();

        public async Task<Category?> GetAsync(string id) =>
            await _categoryCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<Category?> GetCategoryByNameAndUserFk(string name, string userFk) =>
            await _categoryCollection.Find(x => x.Name == name && x.UserFk == userFk).FirstOrDefaultAsync();

        public async Task<List<Category>> GetUserCreatedCategories(string userId)
        {
            return await _categoryCollection.Find(x => x.UserFk == userId).ToListAsync();
        }

        public async Task CreateAsync(Category newCategory)
        {
            await _categoryCollection.InsertOneAsync(newCategory);
        }

        public async Task UpdateAsync(string id, Category updatedCategory) =>
            await _categoryCollection.ReplaceOneAsync(x => x.Id == id, updatedCategory);

        public async Task RemoveAsync(string id) =>
            await _categoryCollection.DeleteOneAsync(x => x.Id == id);
    }
}
