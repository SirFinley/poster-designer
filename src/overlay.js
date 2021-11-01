import * as fabric from "fabric/fabric-impl";
export default class Overlay {
    constructor(canvas) {
        this.canvas = canvas;
    }
    drawOverlay() {
        var rect = new fabric.Rect({
            left: 105,
            top: 100,
            fill: 'red',
            width: 20,
            height: 20
        });
        this.canvas.add(rect);
    }
}
