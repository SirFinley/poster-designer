import { fabric } from 'fabric';
import Poster from './poster';
import room01Background from '../img/room01.jpg';
import room01Foreground from '../img/room01-foreground.png';
import PosterRender from './posterRender';

export default class PreviewCanvas {

    constructor(poster: Poster, canvas: fabric.Canvas) {
        this.poster = poster;
        this.canvas = canvas;
        this.updating = false;
    }

    poster: Poster;
    canvas: fabric.Canvas;
    image?: fabric.Image;
    updating: boolean;

    async drawCanvas() {
        const demoArea = demo01;

        const canvas = this.canvas;
        canvas.clear();

        this.setMovementConstraints(demoArea);

        await Promise.all([
            this.setBackgroundImage(demoArea),
            this.setForegroundImage(demoArea),
            this.addPoster(demoArea),
        ]);

        // TODO: mark done - disable loading indicator
    }

    async updatePoster() {
        this.updating = true;

        const demoArea = demo01;
        const oldImage = this.image

        let options = {};
        if (oldImage) {
            const centerX = oldImage.left! + oldImage.getScaledWidth() / 2;
            const centerY = oldImage.top! + oldImage.getScaledHeight() / 2;
            const realDims = this.poster.settings.realPosterDimensions;
            const pxWidth = realDims.width * demoArea.ppi;
            const pxHeight = realDims.height * demoArea.ppi;

            options = {
                left: centerX - pxWidth / 2,
                top: centerY - pxHeight / 2,
            }
        }

        // TODO: handle if no image on poster (poster cleared)
        await this.addPoster(demoArea, options);

        if (oldImage) {
            this.canvas.remove(oldImage);
        }

        this.canvas.renderAll();
        this.updating = false;
    }

    private async addPoster(demoArea: IDemoArea, options?: fabric.IImageOptions) {
        const realDims = this.poster.settings.realPosterDimensions;
        const pxWidth = realDims.width * demoArea.ppi;
        const pxHeight = realDims.height * demoArea.ppi;
        const maxSide = Math.max(pxWidth, pxHeight);
        const multiplier = 3;

        const dataURL = await new PosterRender().getDataURL(this.poster.settings, this.poster.canvas!, maxSide * multiplier);

        // TODO: preview image not correct, extra padding on right and bottom
        const bounds = demoArea.bounds;
        const imageOptions: fabric.IImageOptions = {
            left: (bounds.left + bounds.right - pxWidth) / 2,
            top: (bounds.top + bounds.bottom - pxHeight) / 2,
            scaleX: 1 / multiplier,
            scaleY: 1 / multiplier,
            ...options,
        };

        const img = await loadFabricImage(dataURL);

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

        img.setOptions(imageOptions);

        this.image = img;
        this.canvas.add(img);
    }

    private setMovementConstraints(demoArea: IDemoArea) {
        this.canvas.on('object:moving', (e) => {
            this.clampPosition(demoArea, e.target);
        });

        this.canvas.on('object:added', (e) => {
            this.clampPosition(demoArea, e.target);
        });
    }

    private clampPosition(demoArea: IDemoArea, obj?: fabric.Object) {
        if (!obj) {
            return;
        }

        const bounds = demoArea.bounds;
        obj.set({
            top: this.clamp(obj.top!, bounds.top, bounds.bottom - obj.getScaledHeight()),
            left: this.clamp(obj.left!, bounds.left, bounds.right - obj.getScaledWidth()),
        });
        obj.setCoords();
    }

    private clamp(num: number, min: number, max: number) {
        return Math.min(Math.max(num, min), max);
    };

    private async setBackgroundImage(demoArea: IDemoArea) {
        // already set
        if (this.canvas.backgroundImage) {
            return;
        }

        this.canvas.setBackgroundImage(await demoArea.backgroundImg, () => {
            this.canvas.renderAll();
        });
    }

    private async setForegroundImage(demoArea: IDemoArea) {
        // already set
        if (this.canvas.overlayImage) {
            return;
        }

        this.canvas.setOverlayImage(await demoArea.foregroundImg, () => {
            this.canvas.renderAll();
        });
    }

}

interface IDemoArea {
    backgroundImg: AsyncFabricImage,
    foregroundImg: AsyncFabricImage,
    ppi: number, // pixels per inch
    bounds: IDemoAreaBounds,
}

function loadFabricImage(url: string): AsyncFabricImage {
    return new Promise((resolve) => {
        fabric.Image.fromURL(url, (img) => {
            resolve(img);
        });
    });
}

type AsyncFabricImage = Promise<fabric.Image>;

interface IDemoAreaBounds {
    left: number,
    top: number,
    right: number,
    bottom: number,
}

const demo01: IDemoArea = {
    backgroundImg: loadFabricImage(room01Background),
    foregroundImg: loadFabricImage(room01Foreground),
    ppi: 12,
    bounds: {
        left: 0,
        top: 0,
        right: 1300,
        bottom: 800,
    }
}