import { fabric } from "fabric";
import Settings from "./settings";

export default class Render {
    constructor(canvas: fabric.Canvas, settings: Settings) {
        this.canvas = canvas;
        this.settings = settings;
    }

    canvas: fabric.Canvas;
    settings: Settings;

    render(){
        fabric.Object.NUM_FRACTION_DIGITS = 8;

        let clone = new fabric.Canvas(null);
        clone.loadFromJSON(this.canvas.toJSON(), () =>{
            clone.overlayImage = undefined;
            let objects = clone.getObjects();

            let image: fabric.Image = new fabric.Image();
            objects.forEach(o => {
                if (o.type != 'image') {
                    clone.remove(o);
                }
                else {
                    image = o as fabric.Image;
                }
            })

            clone.renderAll();

            let dims = this.settings.getVirtualDimensions();

            const imageRawWidth = image.width!;
            const imageCanvasWidth = image.getScaledWidth();
            
            let canvasPixelsPerInch = 1 / dims.inchesPerPixel;
            let imageWidthInInches = imageCanvasWidth / canvasPixelsPerInch;
            let imagePixelsPerInch = imageRawWidth / imageWidthInInches;

            let multiplier = imagePixelsPerInch / canvasPixelsPerInch; 

            console.log('canvas dpi: ' + canvasPixelsPerInch);
            console.log('print dpi: ' + imagePixelsPerInch);
            console.log('render multiplier: ' + multiplier);

            let oldInchesFromLeft = (image.left! - dims.posterLeft) / canvasPixelsPerInch;
            let oldInchesFromTop = (image.top! - dims.posterTop) / canvasPixelsPerInch;
            let newLeft = Math.round(oldInchesFromLeft * imagePixelsPerInch);
            let newTop = Math.round(oldInchesFromTop * imagePixelsPerInch);

            let canvas = new fabric.StaticCanvas(null, {
                width: Math.round(multiplier * dims.posterWidth),
                height: Math.round(multiplier * dims.posterHeight),
                backgroundColor: this.canvas.backgroundColor,
            });

            fabric.Image.fromURL(image.getSrc(), (newImage) => {
                const oldClipPath = image.clipPath!;
                let oldClipInchesFromLeft = (oldClipPath.left! - dims.posterLeft) / canvasPixelsPerInch;
                let oldClipInchesFromTop = (oldClipPath.top! - dims.posterTop) / canvasPixelsPerInch;
                let clipNewLeft = Math.round(oldClipInchesFromLeft * imagePixelsPerInch);
                let clipNewTop = Math.round(oldClipInchesFromTop * imagePixelsPerInch);

                let newClipPath = new fabric.Rect({
                    left: clipNewLeft,
                    top: clipNewTop,
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
                });

                (document.getElementById('img-preview') as HTMLImageElement).src = dataUrl;
            })

        })
    }

    getSaveData(): SaveData{
        // TODO: implement
        return {};
    }
}

interface SaveData {

}