using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using System.Text.Json;

namespace PosterManager.render
{
    class SaveData
    {

        public static async Task<SaveData> Get(string posterId)
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

        public string id { get; set; }
        public int version { get; set; }
        public string size { get; set; }
        public string orientation { get; set; }
        public VirtualDimensions virtualDimensions { get; set; }
        public SaveDataBorders borders { get; set; }
        public object canvasJson { get; set; }
        public SaveDataCanvasImage canvasImage { get; set; }
        public string[] canvasObjectJsons { get; set; }
        public string imageKey { get; set; }
        public string imageThumbnailKey { get; set; }
        
    }

    class DynamoDBSaveData
    {
        [DynamoDBHashKey]
        public string id { get; set; }
        [DynamoDBProperty]
        public string posterJson { get; set; }
        [DynamoDBProperty]
        public string fullRenderKey { get; set; }
        [DynamoDBProperty]
        public string previewRenderKey { get; set; }
    }

    class SaveDataBorders
    {
        public double top { get; set; }
        public double bottom { get; set; }
        public double left { get; set; }
        public double right { get; set; }
        public string color { get; set; }
    }

    class SaveDataCanvasImage
    {
        public double left { get; set; }
        public double top { get; set; }
        public double width { get; set; }
        public double height { get; set; }
        public double scaleX { get; set; }
        public double scaleY { get; set; }
        // TODO: remove cropWidth?
        public double cropWidth { get; set; }
        public double cropHeight { get; set; }
    }
}
