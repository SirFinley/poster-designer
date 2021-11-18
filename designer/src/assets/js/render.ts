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
        // this.canvas.clone((clone: fabric.Canvas) => {
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

            if (!image) {
                return;
            }

            clone.renderAll();
            console.log(clone);

            let dims = this.settings.getVirtualDimensions();

            const imageRawWidth = image.width!;
            const imageCanvasWidth = image.getScaledWidth();
            
            let canvasPixelsPerInch = 1 / dims.inchesPerPixel;
            let imageWidthInInches = imageCanvasWidth / canvasPixelsPerInch;
            let imagePixelsPerInch = imageRawWidth / imageWidthInInches;

            let multiplier = 1 * imagePixelsPerInch / canvasPixelsPerInch; 

            console.log('canvas dpi: ' + canvasPixelsPerInch);
            console.log('print dpi: ' + imagePixelsPerInch);
            console.log('render multiplier: ' + multiplier);

            image.set({
                left: Math.round(image.left!),
                top: Math.round(image.top!),
            })

            let dataUrl = clone.toDataURL({
                width: Math.ceil(dims.posterWidth),
                height: Math.ceil(dims.posterHeight),
                left: Math.round(dims.posterLeft),
                top: Math.round(dims.posterTop),
                // width: dims.posterWidth,
                // height: dims.posterHeight,
                // left: dims.posterLeft,
                // top: dims.posterTop,
                format: 'png',
                multiplier,
            });

            (document.getElementById('img-preview') as HTMLImageElement).src = dataUrl;
        })
    }
}