using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using PosterManager.render;

namespace PosterManager.aws
{
    class DynamoDbFacade
    {

        public DynamoDbFacade(Settings settings)
        {
            Settings = settings;
        }

        public Settings Settings { get; }

        private DynamoDBContextConfig ContextConfig => new DynamoDBContextConfig();
        private DynamoDBOperationConfig OperationConfig => new DynamoDBOperationConfig { OverrideTableName = Settings.GetPostersTable() };

        public async Task<PosterItem> GetPosterItem(string posterId)
        {
            try
            {
                var context = GetContext();
                var item = await context.LoadAsync<PosterItem>(posterId, OperationConfig);
                return item;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task UpdatePoster(PosterItem posterItem)
        {
            try
            {
                var context = GetContext();
                await context.SaveAsync(posterItem, OperationConfig);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        private IDynamoDBContext GetContext()
        {
            var client = new AmazonDynamoDBClient(Settings.GetCreds(), RegionEndpoint.USEast1);
            var context = new DynamoDBContext(client, ContextConfig);
            return context;
        }

    }
}
