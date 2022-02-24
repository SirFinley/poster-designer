using PosterManager.aws;
using PosterManager.form;
using SkiaSharp;
using Svg.Skia;

namespace PosterManager.render
{
    internal class PosterRenderer
    {
        const int svgTargetDpi = 600;

        // TODO - clean up/dispose
        public async Task<RenderResult> Render(PosterItem posterItem)
        {
            var posterId = posterItem.id;
            var saveData = posterItem.GetSaveData();
            var renderSettings = GetRenderSettings(saveData);
            SetUpFiles(posterId, saveData);

            using var surface = SKSurface.Create(new SKImageInfo(renderSettings.canvas.width, renderSettings.canvas.height));
            var canvas = surface.Canvas;

            // draw background
            SKColor color = SKColor.Parse(renderSettings.canvas.backgroundColor);
            canvas.Clear(color);

            // draw image
            if (renderSettings.isSvg)
            {
                var svg = await LoadSvg(posterId, saveData);
                SKMatrix matrix = SKMatrix.CreateScaleTranslation(
                    (float)renderSettings.svgScaledBy,
                    (float)renderSettings.svgScaledBy,
                    renderSettings.image.left,
                    renderSettings.image.top
                );
                canvas.DrawPicture(svg, ref matrix);
            }
            else
            {
                var image = await LoadImage(posterId, saveData);
                canvas.DrawImage(image, new SKRect
                {
                    Left = renderSettings.image.left,
                    Top = renderSettings.image.top,
                    Size = new SKSize(renderSettings.image.width, renderSettings.image.height),
                });
            }

            // draw borders
            var borders = renderSettings.borders;
            int cWidth = renderSettings.canvas.width;
            int cHeight = renderSettings.canvas.height;
            var paint = new SKPaint();
            paint.Color = SKColor.Parse(borders.color);
            canvas.DrawRect(0, 0, borders.leftWidth, cHeight, paint); // left
            canvas.DrawRect(cWidth - borders.rightWidth, 0, borders.rightWidth, cHeight, paint); // right
            canvas.DrawRect(0, 0, cWidth, borders.topWidth, paint); // top
            canvas.DrawRect(0, cHeight - borders.bottomWidth, cWidth, borders.bottomWidth, paint); // bottom
            canvas.Flush();

            var fullImage = surface.Snapshot();
            var fullRender = fullImage.Encode();

            // save full render
            var fullRenderKey = $"{posterItem.id}/full-render.png";
            await SaveImage(PosterFiles.GetFullRenderPath(posterId), fullRender);
            await UploadImage(fullRender, fullRenderKey);

            // save preview render
            var previewRenderKey = $"{posterItem.id}/preview-render.png";
            var previewRender = GetPreview(fullImage, renderSettings);
            await SaveImage(PosterFiles.GetPreviewRenderPath(posterId), previewRender);
            await UploadImage(previewRender, previewRenderKey);

            return new RenderResult
            {
                fullRenderKey = fullRenderKey,
                previewRenderKey = previewRenderKey,
            };
        }

        private async Task SaveImage(string path, SKData data)
        {
            string? directory = Path.GetDirectoryName(path);
            Directory.CreateDirectory(directory);

            using var fileStream = File.Create(path);
            await fileStream.WriteAsync(data.ToArray());
        }

        private async Task UploadImage(SKData data, string key)
        {
            using var stream = data.AsStream();
            await new S3Facade().UploadImage(stream, key);
        }

        private RenderSettings GetRenderSettings(SaveData saveData)
        {
            var image = saveData.canvasImage;

            var dims = saveData.virtualDimensions;

            var imageRawWidth = image.width;
            var imageCanvasWidth = image.width * image.scaleX;

            var canvasPixelsPerInch = 1 / dims.inchesPerPixel;
            var imageWidthInInches = imageCanvasWidth / canvasPixelsPerInch;
            var imagePixelsPerInch = imageRawWidth / imageWidthInInches;

            var canvasMultiplier = imagePixelsPerInch / canvasPixelsPerInch;

            double allMultiplier = 1;
            // if svg, scale everything to reach target dpi
            var isSvg = saveData.imageKey.EndsWith(".svg") || saveData.imageKey.EndsWith(".svg+xml");
            if (isSvg)
            {
                allMultiplier = svgTargetDpi / imagePixelsPerInch;
            }

            Console.WriteLine("canvas dpi: " + canvasPixelsPerInch);
            Console.WriteLine("print dpi: " + imagePixelsPerInch);
            Console.WriteLine("render multiplier: " + canvasMultiplier);

            // round all coordinates and sizes to integers to avoid subpixel rendering

            var canvas = new RenderCanvas {
                width = Round(allMultiplier * canvasMultiplier * dims.posterWidth),
                height = Round(allMultiplier * canvasMultiplier * dims.posterHeight),
                backgroundColor = saveData.borders.color,
            };

            var borders = new RenderBorders {
                leftWidth = Round(allMultiplier * saveData.borders.left * imagePixelsPerInch),
                rightWidth = Round(allMultiplier * saveData.borders.right * imagePixelsPerInch),
                topWidth = Round(allMultiplier * saveData.borders.top * imagePixelsPerInch),
                bottomWidth = Round(allMultiplier * saveData.borders.bottom * imagePixelsPerInch),
                color = saveData.borders.color,
            };


            var oldInchesFromLeft = (image.left - dims.posterLeft) / canvasPixelsPerInch;
            var oldInchesFromTop = (image.top - dims.posterTop) / canvasPixelsPerInch;
            var newImage = new RenderImage {
                left = Round(allMultiplier * oldInchesFromLeft * imagePixelsPerInch),
                top = Round(allMultiplier * oldInchesFromTop * imagePixelsPerInch),
                width = Round(allMultiplier * image.width),
                height = Round(allMultiplier * image.height),
            };

            return new RenderSettings
            {
                borders = borders,
                canvas = canvas,
                image = newImage,
                //imgUrl = await GetImageUrl(saveData),
                isSvg = isSvg,
                svgScaledBy = allMultiplier,
            };
        }

        private int Round(double value)
        {
            return (int)Math.Round(value);
        }

        private SKData GetPreview(SKImage image, RenderSettings renderSettings)
        {
            var maxSide = 300;
            int ogWidth = renderSettings.canvas.width;
            int ogHeight = renderSettings.canvas.height;
            double scale = maxSide / Math.Max((double)ogWidth, ogHeight);

            int smallWidth = (int)(ogWidth * scale);
            int smallHeight = (int)(ogHeight * scale);
            var smallSurface = SKSurface.Create(new SKImageInfo(smallWidth, smallHeight));
            var smallCanvas = smallSurface.Canvas;
            var paint = new SKPaint()
            {
                FilterQuality = SKFilterQuality.High,
            };

            smallCanvas.DrawImage(image, new SKRectI(0, 0, smallWidth, smallHeight), paint);
            smallCanvas.Flush();
            return smallSurface.Snapshot().Encode();
        }

        private async Task<SKImage> LoadImage(string posterId, SaveData saveData)
        {
            // Load into SKImage instead of SKBitmap so that exif orientation data is taken into account
            // otherwise picture may be rotated incorrectly and streched
            string key = saveData.imageKey;
            using Stream stream = await new S3Facade().GetObject(key);

            await SaveUpload(posterId, key, stream);

            using var file = File.Open(PosterFiles.GetUpload(posterId), FileMode.Open);
            var image = SKImage.FromEncodedData(file);
            return image;
        }

        private async Task<SKPicture> LoadSvg(string posterId, SaveData saveData)
        {
            string key = saveData.imageKey;
            using Stream stream = await new S3Facade().GetObject(key);

            await SaveUpload(posterId, key, stream);

            var svg = new SKSvg();
            svg.Load(PosterFiles.GetUpload(posterId));
            return svg.Picture;
        }

        private async Task SaveUpload(string posterId, string key, Stream stream)
        {
            string path = PosterFiles.GetUpload(posterId, key);
            await SaveImage(path, stream);
        }

        private async Task SetUpFiles(string posterId, SaveData saveData)
        {
            // ensure directory exists
            string path = PosterFiles.GetUpload(posterId, "upload");
            string? directory = Path.GetDirectoryName(path);
            Directory.CreateDirectory(directory);

            // clean up old uploads
            var uploadFiles = Directory.GetFiles(directory, "upload.*");
            uploadFiles.ToList().ForEach(f => File.Delete(f));

            // download client render
            string key = saveData.imageThumbnailKey;
            using Stream stream = await new S3Facade().GetObject(key);
            await SaveImage(PosterFiles.GetThumbnail(posterId), stream);
        }

        private async Task SaveImage(string path, Stream stream)
        {
            using MemoryStream memstream = new MemoryStream();
            await stream.CopyToAsync(memstream);
            memstream.Seek(0, SeekOrigin.Begin);

            using var fileStream = File.Create(path);
            await fileStream.WriteAsync(memstream.ToArray());
        }

    }
}
