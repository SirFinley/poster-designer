import { fabric } from 'fabric';
import FastAverageColor from 'fast-average-color';
import eventHub from './posterEventHub';
import Settings from './settings';
export default class PosterImage {
    constructor(canvas: fabric.Canvas, settings: Settings) {
        this.canvas = canvas;
        this.settings = settings;

        this.image = null;
        this.imageAspectRatio = 0;
        this.imgElem = null;
        this.uploadFile = () => { throw new Error('upload file not implemented'); };

        this.setupEventListeners();
    }

    canvas: fabric.Canvas;
    settings: Settings;

    imageInput?: HTMLInputElement;
    image: fabric.Image | null;
    imageAspectRatio: number;
    imgElem: HTMLImageElement | null;
    uploadFile: (files: FileList) => void;

    setupEventListeners() {

        // image scaled
        eventHub.subscribe('imageScaled', () => {
            if (!this.image) {
                return;
            }

            let prevWidth = this.image.getScaledWidth();
            let prevHeight = this.image.getScaledHeight();

            let dims = this.settings.getVirtualDimensions();
            let scale = this.settings.imageScaleValue;

            this.scaleToWidth(dims.posterWidth * scale);

            // keep centered on center point
            let dx = (this.image.getScaledWidth() - prevWidth) / 2;
            let dy = (this.image.getScaledHeight() - prevHeight) / 2;
            this.moveImageTo({
                left: this.image.left! - dx,
                top: this.image.top! - dy,
            })

            this.canvas.renderAll();
        });

        eventHub.subscribe('sizeSettingChanged', () => this.updateScaleSlider());
        eventHub.subscribe('orientationSettingChanged', () => this.updateScaleSlider());
        eventHub.subscribe('imageUploadCancelled', () => this.clearImage());
        eventHub.subscribe('imageCleared', () => this.clearImage());
    }

    setNewImage(image: fabric.Image) {
        image.setControlsVisibility({
            mb: false,
            ml: false,
            mr: false,
            mt: false,
            mtr: false,
        });

        image.set({
            centeredScaling: true,
            name: 'main-image',
        })

        if (this.image) {
            this.canvas.remove(this.image);
        }
        this.image = image;
        this.imageAspectRatio = this.image.width! / this.image.height!;
        this.image.on('scaling', (e) => {
            this.updateScaleSlider();
        });


        this.fitImageToBorders();
        this.canvas.add(image);
        this.canvas.renderAll();

        let avgColor = this.getAverageColor();
        this.settings.setBorderColor(avgColor);
        this.canvas.setBackgroundColor(avgColor, () => { });
        this.canvas.renderAll();

        eventHub.triggerEvent('imageChanged');
        eventHub.triggerEvent('colorChanged');
    }

    centerImage() {
        if (!this.image) {
            return;
        }

        let dims = this.settings.getVirtualDimensions();
        let scaledImageWidth = this.image.getScaledWidth();
        let scaledImageHeight = this.image.getScaledHeight();
        let imageLeftOffset = (dims.posterInnerBorderWidth - scaledImageWidth) / 2;
        let imageTopOffset = (dims.posterInnerBorderHeight - scaledImageHeight) / 2;

        this.moveImageTo({
            left: dims.posterLeftBorder + imageLeftOffset,
            top: dims.posterTopBorder + imageTopOffset,
        });

        this.canvas.renderAll();
    }

    centerImageVertical() {
        if (!this.image) {
            return;
        }

        let dims = this.settings.getVirtualDimensions();
        let scaledImageHeight = this.image.getScaledHeight();
        let imageTopOffset = (dims.posterInnerBorderHeight - scaledImageHeight) / 2;

        this.moveImageTo({
            top: dims.posterTopBorder + imageTopOffset,
        });

        this.canvas.renderAll();
    }

    centerImageHorizontal() {
        if (!this.image) {
            return;
        }

        let dims = this.settings.getVirtualDimensions();
        let scaledImageWidth = this.image.getScaledWidth();
        let imageLeftOffset = (dims.posterInnerBorderWidth - scaledImageWidth) / 2;

        this.moveImageTo({
            left: dims.posterLeftBorder + imageLeftOffset,
        });

        this.canvas.renderAll();
    }

    updateScaleSlider() {
        if (!this.image) {
            return;
        }

        let scale = this.image.getScaledWidth() / this.settings.getVirtualDimensions().posterWidth;
        this.settings.setImageScale(scale);
    }

    moveImageTo(coords: ImageCoords) {
        this.image?.set(coords);
        this.image?.setCoords();
    }


    clearImage() {
        if (this.image) {
            this.canvas.remove(this.image);
            this.image = null;
            this.canvas.backgroundColor = 'white';
            this.canvas.renderAll();
        }

        if (this.imageInput) {
            this.imageInput.value = '';
        }
    }

    getAverageColor() {
        if (!this.imgElem) {
            return this.settings.borderColor as string;
        }

        let fac = new FastAverageColor();
        return fac.getColor(this.imgElem, {
            algorithm: 'dominant',
            mode: 'speed',

        }).hex;
    }

    fitImageToBorders() {
        if (!this.image) {
            return;
        }

        let dims = this.settings.getVirtualDimensions();

        if (this.imageAspectRatio >= dims.borderInnerAspectRatio) { // image wider than canvas
            this.scaleToWidth(dims.posterInnerBorderWidth);
        }
        else { // image taller than poster
            this.scaleToHeight(dims.posterInnerBorderHeight);
        }

        this.centerImage();
        this.canvas.renderAll();
    }

    fillBorders() {
        if (!this.image) {
            return;
        }

        let dims = this.settings.getVirtualDimensions();

        if (this.imageAspectRatio >= dims.borderInnerAspectRatio) { // image wider than canvas
            this.scaleToHeight(dims.posterInnerBorderHeight);
        }
        else { // image taller than poster
            this.scaleToWidth(dims.posterInnerBorderWidth);
        }

        this.centerImage();
        this.canvas.renderAll();
    }

    fillPoster() {
        if (!this.image) {
            return;
        }

        let dims = this.settings.getVirtualDimensions();

        if (this.imageAspectRatio >= dims.posterAspectRatio) { // image wider than canvas
            this.scaleToHeight(dims.posterHeight);
        }
        else { // image taller than poster
            this.scaleToWidth(dims.posterWidth);
        }

        this.centerImage();
        this.canvas.renderAll();
    }

    scaleToWidth(width: number) {
        if (!this.image) {
            return;
        }

        this.image.scale(width / this.image.width!);
        this.updateScaleSlider();
    }

    scaleToHeight(height: number) {
        if (!this.image) {
            return;
        }

        this.image.scale(height / this.image.height!);
        this.updateScaleSlider();
    }

}

interface ImageCoords {
    left?: number,
    top?: number,
}