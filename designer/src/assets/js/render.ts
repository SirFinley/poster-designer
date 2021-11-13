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
        let clone = new fabric.Canvas(null);
        clone.loadFromJSON(this.canvas.toJSON(), () =>{
        // this.canvas.clone((clone: fabric.Canvas) => {
            clone.overlayImage = undefined;
            let objects = clone.getObjects();
            objects.forEach(o => {
                if (o.type != 'image') {
                    clone.remove(o);
                }
            })

            clone.renderAll();
            console.log(clone);

            let dims = this.settings.getVirtualDimensions();
            let multiplier = 2; // TODO: get multiplier based on image size, dpi, etc.

            let dataUrl = clone.toDataURL({
                width: dims.posterWidth,
                height: dims.posterHeight,
                left: dims.posterLeft,
                top: dims.posterTop,
                format: 'png',
                multiplier,
            });

            // document.getElementById('img-preview').src = dataUrl;
        })
    }
}