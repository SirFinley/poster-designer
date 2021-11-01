import { fabric } from "fabric";
import Settings from "./settings";
import VirtualDimensions from './virtualDimensions';

export default class Overlay {
    constructor(canvas: fabric.Canvas, settings: Settings) {
        this.canvas = canvas;
        this.settings = settings;

        this.overlayPath = new fabric.Path();

        this.drawOverlay();
        settings.onOverlayChanged = () => this.drawOverlay();
    }

    canvas: fabric.Canvas;
    settings: Settings;
    overlayPath: fabric.Path;

    clearOverlay() {
        if (this.overlayPath) {
            this.canvas.remove(this.overlayPath);
        }
    }

    drawOverlay() {
        const fill = 'gray';
        const opacity = 0.6;

        this.clearOverlay();

        let dimensions = this.settings.getVirtualDimensions(this.canvas);

        let svg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.canvasWidth}" height="${dimensions.canvasHeight}">
        <defs>
            <mask id="hole">
                <rect width="${dimensions.canvasWidth}" height="${dimensions.canvasHeight}" fill="white"/>      
                <rect x="${dimensions.canvasHorizontalMargin}" y="${dimensions.canvasVerticalMargin}" width="${dimensions.posterWidth}" height="${dimensions.posterHeight}" fill="black"/>    
            </mask>  
        </defs>  
        <rect width="${dimensions.canvasWidth}" height="${dimensions.canvasHeight}" fill="${fill}" mask="url(%23hole)"/>
        </svg>`;
        console.log(this.canvas);
        fabric.Image.fromURL(svg, (img: fabric.Image) => {
            img.set({
                width: dimensions.canvasWidth,
                height: dimensions.canvasHeight,
                top: 0,
                left: 0,
                opacity: opacity,
            });
            this.canvas.setOverlayImage(img, () => this.canvas.renderAll());
        });
    }

}