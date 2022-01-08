import { fabric } from 'fabric';
import Poster from './poster';
import room01Background from '../img/room01.jpg';
import room01Foreground from '../img/room01-foreground.png';
import PosterRender from './posterRender';

export default class PreviewCanvas {

    constructor(poster: Poster, canvas: fabric.Canvas) {
        this.poster = poster;
        this.canvas = canvas;
    }

    poster: Poster;
    canvas: fabric.Canvas;

    async drawCanvas() {
        const demoArea = demo01;

        const canvas = this.canvas;
        canvas.clear();

        this.setBackgroundImage(demoArea);
        this.setForegroundImage(demoArea);

        this.setMovementConstraints(demoArea);

        this.addPoster(demoArea);
    }

    private async addPoster(demoArea: IDemoArea) {
        const realDims = this.poster.settings.realPosterDimensions;
        const pxWidth = realDims.width * demoArea.ppi;
        const pxHeight = realDims.height * demoArea.ppi;
        const maxSide = Math.max(pxWidth, pxHeight);
        const multiplier = 3;

        const dataURL = await new PosterRender().getDataURL(this.poster.settings, this.poster.canvas!, maxSide * multiplier);

        const imageOptions: fabric.IImageOptions = {
            left: 0,
            top: 0,
            scaleX: 1 / multiplier,
            scaleY: 1 / multiplier,
        };

        fabric.Image.fromURL(dataURL, (img) => {
            // disable controls for scaling/rotation
            img.setControlsVisibility({
                mtr: false,
                tl: false,
                mt: false,
                tr: false,
                mr: false,
                br: false,
                mb: false,
                bl: false,
                ml: false,
            });
            
            this.canvas.add(img);
        }, imageOptions);
    }

    private setMovementConstraints(demoArea: IDemoArea) {
        this.canvas.on('object:moving', (e) => {
            const obj = e.target;
            if (!obj) {
                return;
            }

            const bounds = demoArea.bounds;
            obj.set({
                top: this.clamp(obj.top!, bounds.top, bounds.bottom - obj.getScaledHeight()),
                left: this.clamp(obj.left!, bounds.left, bounds.right - obj.getScaledWidth()),
            });
            obj.setCoords();
        });
    }

    private clamp(num:number, min:number, max:number) {
        return Math.min(Math.max(num, min), max);
      };

    private setBackgroundImage(demoArea: IDemoArea) {
        // already set
        if (this.canvas.backgroundImage) {
            return;
        }

        this.canvas.setBackgroundImage(demoArea.backgroundImgUrl, () => {
            this.canvas.renderAll();
        });
    }

    private setForegroundImage(demoArea: IDemoArea) {
        // already set
        if (this.canvas.overlayImage) {
            return;
        }

        this.canvas.setOverlayImage(demoArea.foregroundImgUrl, () => {
            this.canvas.renderAll();
        });
    }

}

interface IDemoArea {
    backgroundImgUrl: string,
    foregroundImgUrl: string,
    ppi: number, // pixels per inch
    bounds: IDemoAreaBounds,
}

interface IDemoAreaBounds {
    left: number,
    top: number,
    right: number,
    bottom: number,
}

const demo01: IDemoArea = {
    backgroundImgUrl: room01Background,
    foregroundImgUrl: room01Foreground,
    ppi: 12,
    bounds: {
        left: 0,
        top: 0,
        right: 1300,
        bottom: 800,
    }
}