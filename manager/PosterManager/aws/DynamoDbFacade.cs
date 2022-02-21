using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using PosterManager.render;
using System.Text.Json;

namespace PosterManager.aws
{
    class DynamoDbFacade
    {
        public async Task<SaveData> GetSaveData(string posterId)
        {
            try
            {
                const string tableName = "dev-sst-Posters";
                var client = new AmazonDynamoDBClient(RegionEndpoint.USEast1);
                var context = new DynamoDBContext(client, new DynamoDBContextConfig
                {
                    
                });
                var item = await context.LoadAsync<DynamoDBSaveData>(posterId, new DynamoDBOperationConfig { OverrideTableName = tableName });

                var saveData = JsonSerializer.Deserialize<SaveData>(item.posterJson);
                return saveData;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task UpdatePoster(RenderResult renderResult)
        {

        }

    }
}
