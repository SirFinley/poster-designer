import { fabric } from "fabric";
import PosterImage from "./image";
import Settings from "./settings";
import PosterExporter, { SaveData } from "./PosterExporter";

export default class Render {
    constructor(image: PosterImage, canvas: fabric.Canvas, settings: Settings) {
        this.image = image;
        this.canvas = canvas;
        this.settings = settings;
    }

    image: PosterImage;
    canvas: fabric.Canvas;
    settings: Settings;

    async render() {
        fabric.Object.NUM_FRACTION_DIGITS = 8;

        let saveData = await new PosterExporter().getSaveData(this.settings, this.canvas, this.image);

        let image = saveData.canvasImage;

        let dims = saveData.virtualDimensions;

        const imageRawWidth = image.width;
        const imageCanvasWidth = image.width * image.scaleX;

        let canvasPixelsPerInch = 1 / dims.inchesPerPixel;
        let imageWidthInInches = imageCanvasWidth / canvasPixelsPerInch;
        let imagePixelsPerInch = imageRawWidth / imageWidthInInches;

        let multiplier = imagePixelsPerInch / canvasPixelsPerInch;

        console.log('canvas dpi: ' + canvasPixelsPerInch);
        console.log('print dpi: ' + imagePixelsPerInch);
        console.log('render multiplier: ' + multiplier);

        let oldInchesFromLeft = (image.left - dims.posterLeft) / canvasPixelsPerInch;
        let oldInchesFromTop = (image.top - dims.posterTop) / canvasPixelsPerInch;
        let newLeft = Math.round(oldInchesFromLeft * imagePixelsPerInch);
        let newTop = Math.round(oldInchesFromTop * imagePixelsPerInch);

        let canvas = new fabric.StaticCanvas(null, {
            width: Math.round(multiplier * dims.posterWidth),
            height: Math.round(multiplier * dims.posterHeight),
            backgroundColor: saveData.borders.color,
        });

        fabric.Image.fromURL(this.getImageUrl(saveData), (newImage) => {
            let newClipPath = new fabric.Rect({
                left: Math.round(saveData.borders.horizontal * imagePixelsPerInch),
                top: Math.round(saveData.borders.vertical * imagePixelsPerInch),
                width: Math.round(multiplier * dims.posterInnerBorderWidth),
                height: Math.round(multiplier * dims.posterInnerBorderHeight),
                absolutePositioned: true,
            });

            newImage.set({
                left: newLeft,
                top: newTop,
                clipPath: newClipPath,
            });

            canvas.add(newImage);
            canvas.renderAll();

            let dataUrl = canvas.toDataURL({
                format: 'png',
                multiplier: 1,
            });

            (document.getElementById('img-preview') as HTMLImageElement).src = dataUrl;
        })
    }

    getImageUrl(saveData: SaveData): string {
        // client
        return this.image.image!.getSrc()

        // server
        // get s3 link for saveData.imageKey
    }
}