import { fabric } from "fabric";
import Settings from "./settings";

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

        let canvasWidth = this.canvas.width!;
        let canvasHeight = this.canvas.height!;
        let canvasAspectRatio = canvasWidth / canvasHeight;
        let posterAspectRatio = this.settings.getAspectRatio();

        let posterWidth;
        let posterHeight;

        const overlayMargin = 0.9;
        if (posterAspectRatio >= canvasAspectRatio) { // poster wider than canvas
            posterWidth = overlayMargin * canvasWidth;
            posterHeight = posterWidth / posterAspectRatio;
        }
        else { // poster taller than canvas
            posterHeight = overlayMargin * canvasHeight;
            posterWidth = posterAspectRatio * posterHeight;
        }

        let horizontalMargin = (canvasWidth - posterWidth) / 2;
        let verticalMargin = (canvasHeight - posterHeight) / 2;

        let svg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
        <defs>
            <mask id="hole">
                <rect width="${canvasWidth}" height="${canvasHeight}" fill="white"/>      
                <rect x="${horizontalMargin}" y="${verticalMargin}" width="${posterWidth}" height="${posterHeight}" fill="black"/>    
            </mask>  
        </defs>  
        <rect width="${canvasWidth}" height="${canvasHeight}" fill="${fill}" mask="url(%23hole)"/>
        </svg>`;
        console.log(this.canvas);
        fabric.Image.fromURL(svg, (img: fabric.Image) => {
            img.set({
                width: canvasWidth,
                height: canvasHeight,
                top: 0,
                left: 0,
                opacity: opacity,
            });
            this.canvas.setOverlayImage(img, this.canvas.renderAll.bind(this.canvas));     
        });
    }

}