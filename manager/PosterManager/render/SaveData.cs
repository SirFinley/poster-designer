using Amazon.DynamoDBv2.DataModel;
using System.Text.Json;

namespace PosterManager.render
{
    class SaveData
    {

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

    class PosterItem
    {

        [DynamoDBHashKey]
        public string id { get; set; }
        [DynamoDBProperty]
        public string posterJson { get; set; }
        [DynamoDBProperty]
        public string? fullRenderKey { get; set; }
        [DynamoDBProperty]
        public string? previewRenderKey { get; set; }
        [DynamoDBProperty]
        public DateTime? timeAdded { get; set; }
        [DynamoDBProperty]
        public DateTime? timeRendered { get; set; }

        public SaveData GetSaveData()
        {
            return JsonSerializer.Deserialize<SaveData>(posterJson);
        }

        public bool HasRenders()
        {
            return !string.IsNullOrEmpty(fullRenderKey) && !string.IsNullOrEmpty(previewRenderKey);
        }

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
