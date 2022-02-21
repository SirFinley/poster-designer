using PosterManager.aws;
using SkiaSharp;
using Svg.Skia;

namespace PosterManager.render
{
    internal class PosterRenderer
    {
        const int svgTargetDpi = 600;

        // TODO - clean up/dispose
        public async Task Render(SaveData saveData)
        {
            var renderSettings = GetRenderSettings(saveData);

            using var surface = SKSurface.Create(new SKImageInfo(renderSettings.canvas.width, renderSettings.canvas.height));
            var canvas = surface.Canvas;

            // draw background
            SKColor color = SKColor.Parse(renderSettings.canvas.backgroundColor);
            canvas.Clear(color);

            // draw image
            if (renderSettings.isSvg)
            {
                var svg = await LoadSvg(saveData);
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
                var bitmap = await LoadBitmap(saveData);
                canvas.DrawBitmap(bitmap, new SKRect
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

            var fullRender = surface.Snapshot().Encode();
            FileStream target = File.OpenWrite("D:/Work/posters/test.png");
            fullRender.SaveTo(target);

            // save full render
            // TODO - implement

            // save preview render
            // TODO - implement
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

        private async Task<SKBitmap> LoadBitmap(SaveData saveData)
        {
            string key = saveData.imageKey;
            using (Stream stream = await new S3Facade().GetObject(key))
            using (MemoryStream memstream = new MemoryStream())
            {
                await stream.CopyToAsync(memstream);
                memstream.Seek(0, SeekOrigin.Begin);

                var bitmap = SKBitmap.Decode(memstream);
                return bitmap;
            }
        }

        private async Task<SKPicture> LoadSvg(SaveData saveData)
        {
            string key = saveData.imageKey;
            using Stream stream = await new S3Facade().GetObject(key);
            using MemoryStream memstream = new MemoryStream();
            var svg = new SKSvg();
            svg.Load(stream);
            //svg.Load("D:/Work/posters/tiger2.svg");
            return svg.Picture;
        }

    }
}
