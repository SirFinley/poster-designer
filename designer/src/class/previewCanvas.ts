import { fabric } from 'fabric';
import Poster from './poster';
import room01Background from '../img/room01.jpg';
import room01Foreground from '../img/room01-foreground.png';
import PosterRender from './posterRender';

const renderMultiplier = 3;

export default class PreviewCanvas {

    constructor(poster: Poster, canvas: fabric.Canvas) {
        this.poster = poster;
        this.canvas = canvas;
        this.updating = false;
        this.needsUpdate = false;
        this.demoArea = demo01;
    }

    poster: Poster;
    canvas: fabric.Canvas;
    image?: fabric.Image;
    updating: boolean;
    needsUpdate: boolean;
    demoArea: IDemoArea;

    async drawCanvas() {
        this.updating = true;
        const demoArea = this.demoArea;
        if (demoArea.width <= 0 || demoArea.height <= 0) {
            throw new Error('invalid demo area dimensions');
        }

        const canvas = this.canvas;
        canvas.clear();

        this.setMovementConstraints(demoArea);

        await Promise.all([
            this.setBackgroundImage(demoArea),
            this.setForegroundImage(demoArea),
            this.addPoster(demoArea),
        ]);

        // TODO: mark done - disable loading indicator
        this.updating = false;
    }

    async updatePoster() {
        this.updating = true;
        
        const demoArea = demo01;
        const oldImage = this.image

        let options = {};
        if (oldImage) {
            const centerX = oldImage.left! + oldImage.getScaledWidth() / 2;
            const centerY = oldImage.top! + oldImage.getScaledHeight() / 2;

            options = {
                left: centerX - this.targetPosterWidthPx / 2,
                top: centerY - this.targetPosterHeightPx / 2,
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

    private get targetPosterWidthPx() {
        const realDims = this.poster.settings.realPosterDimensions;
        return realDims.width * this.demoArea.ppi * this.backgroundScale;
    }

    private get targetPosterHeightPx() {
        const realDims = this.poster.settings.realPosterDimensions;
        return realDims.height * this.demoArea.ppi * this.backgroundScale;
    }

    get backgroundImage() {
        return this.canvas.backgroundImage as fabric.Image | null;
    }

    get foregroundImage() {
        return this.canvas.overlayImage as fabric.Image | null;
    }

    resize() {
        if (this.backgroundImage) {
            this.backgroundImage.scaleToWidth?.(this.canvas.width!);
        }
        if (this.foregroundImage) {
            this.foregroundImage.scaleToWidth?.(this.canvas.width!);
        }

        this.resizeImage();
    }

    private resizeImage() {
        if (!this.image) {
            return;
        }

        const scale = this.targetPosterWidthPx / this.image.getScaledWidth();
        this.image.scaleToWidth(this.targetPosterWidthPx);
        this.image.setCoords();

        this.image.set({
            left: this.image.left! * scale,
            top: this.image.top! * scale,
        })
        this.clampPosition(this.demoArea, this.image);
        this.image.setCoords();

        this.canvas.renderAll();
    }

    private get backgroundScale() {
        return this.backgroundImage?.scaleX || 1;
    }

    private async addPoster(demoArea: IDemoArea, options?: fabric.IImageOptions) {
        const pxWidth = this.targetPosterWidthPx;
        const pxHeight = this.targetPosterHeightPx;
        const maxSide = Math.max(pxWidth, pxHeight);

        const dataURL = await new PosterRender().getDataURL(this.poster.settings, this.poster.canvas!, maxSide * renderMultiplier);

        // TODO: preview image not correct, extra padding on right and bottom
        const bounds = demoArea.getBounds(this.canvas);
        const imageOptions: fabric.IImageOptions = {
            left: (bounds.left + bounds.right - pxWidth) / 2,
            top: (bounds.top + bounds.bottom - pxHeight) / 2,
            scaleX: 1 / renderMultiplier,
            scaleY: 1 / renderMultiplier,
            shadow: new fabric.Shadow({
                color: '#888',
                blur: 10,
                offsetX: -10,
                offsetY: 5,
            }),
            hasBorders: false,
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

        if (!this.canvas.backgroundImage) {
            return;
        }

        const bounds = demoArea.getBounds(this.canvas);
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

        this.canvas.setBackgroundImage(await demoArea.backgroundImg, (img: fabric.Image) => {
            img.scaleToWidth(this.canvas.width!);
            this.canvas.renderAll();
        });
    }

    private async setForegroundImage(demoArea: IDemoArea) {
        // already set
        if (this.canvas.overlayImage) {
            return;
        }

        this.canvas.setOverlayImage(await demoArea.foregroundImg, (img: fabric.Image) => {
            img.scaleToWidth(this.canvas.width!);
            this.canvas.renderAll();
        });
    }

}

interface IDemoArea {
    backgroundImg: AsyncFabricImage,
    foregroundImg: AsyncFabricImage,
    ppi: number, // pixels per inch
    imageBounds: IDemoAreaBounds,
    width: number,
    height: number,
    getBounds: (canvas: fabric.Canvas) => IDemoAreaBounds,
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
    imageBounds: {
        left: 0,
        top: 0,
        right: 1300,
        bottom: 800,
    },
    width: 1500,
    height: 1062,
    getBounds: function(canvas: fabric.Canvas) {
        const scale = canvas.width! / this.width;
        
        return {
            left: scale * this.imageBounds.left,
            top: scale * this.imageBounds.top,
            right: scale * this.imageBounds.right,
            bottom: scale * this.imageBounds.bottom,
        }
    }
}