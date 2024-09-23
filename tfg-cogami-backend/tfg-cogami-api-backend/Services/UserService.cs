using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using tfg_cogami_api_backend.Models;
using tfg_cogami_api_backend.Models.Property;
using tfg_cogami_api_backend.Models.Search;
using tfg_cogami_api_backend.Models.User;

namespace tfg_cogami_api_backend.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _userCollection;
        public UserService(IOptions<CogamiDatabaseSettings> cogamiDatabaseSettings)
        {
            var mongoClient = new MongoClient(cogamiDatabaseSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(cogamiDatabaseSettings.Value.DatabaseName);

            _userCollection = mongoDatabase.GetCollection<User>(cogamiDatabaseSettings.Value.Collections.Where(x => x == "User").FirstOrDefault());
            CreateUniqueIndex();
        }

        public void CreateUniqueIndex()
        {
            var indexOptions = new CreateIndexOptions { Unique = true };
            var indexKeyUsername = Builders<User>.IndexKeys.Ascending(user => user.Username);
            var indexKeyEmail = Builders<User>.IndexKeys.Ascending(user => user.Email);

            var indexModelUsername = new CreateIndexModel<User>(indexKeyUsername, indexOptions);
            var indexModelEmail = new CreateIndexModel<User>(indexKeyEmail, indexOptions);

            _userCollection.Indexes.CreateMany([indexModelUsername, indexModelEmail]);
        }

        public async Task<List<User>> GetAync() => 
            await _userCollection.Find(_ => true).ToListAsync();
        public async Task<User> GetAsync(string id) =>
            await _userCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
        public async Task<User> GetAsyncByEmail(string email) =>
            await _userCollection.Find(x => x.Email == email).FirstOrDefaultAsync();
        public async Task<User> GetAsyncByUsername(string username) =>
            await _userCollection.Find(x => x.Username == username).FirstOrDefaultAsync();
        public async Task CreateAsync(User user) =>
            await _userCollection.InsertOneAsync(user);
        public async Task UpdateAsync(string id, User newUser) => 
            await _userCollection.ReplaceOneAsync(x => x.Id == id, newUser);
        public async Task DeleteAsync(string id) =>
            await _userCollection.DeleteOneAsync(x => x.Id == id);
        public async Task FavoriteProperty(string userId, FollowedProperty newFollowed)
        {
            var filter = Builders<User>.Filter.Eq(user => user.Id, userId);
            var update = Builders<User>.Update.Push(user => user.FollowedProperties, newFollowed);
            await _userCollection.UpdateOneAsync(filter, update);
        }


        public async Task UnfavoriteProperty(string userId, FollowedProperty newFollowed)
        {
            var filter = Builders<User>.Filter.Eq(user => user.Id, userId);
            var update = Builders<User>.Update.Pull(user => user.FollowedProperties, newFollowed);
            await _userCollection.UpdateOneAsync(filter, update);
        }

        public async Task MarkAsNotInterested(string userId, NotInterestedProperty notInterested)
        {
            var filter = Builders<User>.Filter.Eq(user => user.Id, userId);
            var update = Builders<User>.Update.Push(user => user.NotInterestedProperties, notInterested);
            await _userCollection.UpdateOneAsync(filter, update);
        }

        public async Task UnmarkAsNotInterested(string userId, NotInterestedProperty notInterested)
        {
            var filter = Builders<User>.Filter.Eq(user => user.Id, userId);
            var update = Builders<User>.Update.Pull(user => user.NotInterestedProperties, notInterested);
            await _userCollection.UpdateOneAsync(filter, update);
        }

        public async Task EditCommentFavorite(string userId, string propertyId, string newComment)
        {
            var filter = Builders<User>.Filter.Eq(user => user.Id, userId);
            var update = Builders<User>.Update.Set("FollowedProperties.$[elem].Comment", newComment);

            var arrayFilters = new List<ArrayFilterDefinition>
            {
                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("elem._id", propertyId))
            };

            var updateOptions = new UpdateOptions { ArrayFilters = arrayFilters };
            var result = await _userCollection.UpdateOneAsync(filter, update, updateOptions);
        }

        public async Task UpdateNotificationsFavorite(string userId, string propertyId, int newNotifications)
        {
            var filter = Builders<User>.Filter.Eq(user => user.Id, userId);
            var update = Builders<User>.Update.Set("FollowedProperties.$[elem].Notifications", newNotifications);

            var arrayFilters = new List<ArrayFilterDefinition>
            {
                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("elem._id", propertyId))
            };

            var updateOptions = new UpdateOptions { ArrayFilters = arrayFilters };
            var result = await _userCollection.UpdateOneAsync(filter, update, updateOptions);
        }
        
        public async Task UpdateNotificationsMessage(string userId, string propertyId, string? newMessage)
        {
            var filter = Builders<User>.Filter.Eq(user => user.Id, userId);
            var update = Builders<User>.Update.Set("FollowedProperties.$[elem].NotificationMessage", newMessage);

            var arrayFilters = new List<ArrayFilterDefinition>
            {
                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("elem._id", propertyId))
            };

            var updateOptions = new UpdateOptions { ArrayFilters = arrayFilters };
            var result = await _userCollection.UpdateOneAsync(filter, update, updateOptions);
        }

        public async Task UpdateFavoritePropertyCategory(string userId, string propertyId, string newCategoryId)
        {
            var filter = Builders<User>.Filter.Eq(user => user.Id, userId);
            var update = Builders<User>.Update.Set("FollowedProperties.$[elem].CategoryId", newCategoryId);

            var arrayFilters = new List<ArrayFilterDefinition>
            {
                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("elem._id", propertyId))
            };

            var updateOptions = new UpdateOptions { ArrayFilters = arrayFilters };
            var result = await _userCollection.UpdateOneAsync(filter, update, updateOptions);
        }
    }
}
