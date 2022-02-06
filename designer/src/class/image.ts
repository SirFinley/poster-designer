import { fabric } from 'fabric';
import FastAverageColor from 'fast-average-color';
import { action, autorun, makeAutoObservable } from 'mobx';
import Poster from './poster';
import Settings from './settings';

const SVG_DPI = 600;
export default class PosterImage {
    constructor(poster: Poster, canvas: fabric.Canvas, settings: Settings) {
        makeAutoObservable(this, {
            updateScaleSlider: action,
        });

        this.poster = poster;
        this.canvas = canvas;
        this.settings = settings;

        this.image = null;
        this.isSvg = false;
        this.imageAspectRatio = 0;
        this.imagePosterRatio = 1;
        this.imgElem = null;
        this.uploadStatus = 'none';
        this.renderStatus = 'none';
        this.uploadFile = () => { throw new Error('upload file not implemented'); };

        this.setupEventListeners();
    }

    poster: Poster;
    canvas: fabric.Canvas;
    settings: Settings;

    imageInput?: HTMLInputElement;

    isSvg: boolean;
    image: fabric.Image | null;
    imageAspectRatio: number;
    imgElem: HTMLImageElement | null;
    imagePosterRatio: number;
    uploadStatus: 'none' | 'uploading' | 'uploaded';
    renderStatus: 'none' | 'rendering' | 'rendered';

    uploadFile: (files: FileList) => void;

    setupEventListeners() {
        autorun(() => this.onScaled());
    }

    onScaled() {
        if (!this.image) {
            return;
        }

        const prevWidth = this.image.getScaledWidth();
        const prevHeight = this.image.getScaledHeight();

        const dims = this.settings.getVirtualDimensions();
        const scale = this.imagePosterRatio;

        this.scaleToWidth(dims.posterWidth * scale);

        // keep centered on center point
        const dx = (this.image.getScaledWidth() - prevWidth) / 2;
        const dy = (this.image.getScaledHeight() - prevHeight) / 2;
        this.moveImageTo({
            left: this.image.left! - dx,
            top: this.image.top! - dy,
        })

        this.canvas.renderAll();
    }

    get dpi(): number | null {
        if (!this.image || !this.image.width) {
            return null;
        }

        if (this.isSvg) {
            return SVG_DPI;
        }

        const imageRawWidthPixels = this.image.width;
        const posterWidthInches = this.settings.realPosterDimensions.width;

        return imageRawWidthPixels / posterWidthInches / this.imagePosterRatio;
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

        const avgColor = this.getAverageColor();
        this.settings.setBorderColor(avgColor);
        this.canvas.setBackgroundColor(avgColor, () => { });
        this.canvas.renderAll();

        this.renderStatus = 'rendered';
    }

    centerImage() {
        if (!this.image) {
            return;
        }

        const dims = this.settings.getVirtualDimensions();
        const scaledImageWidth = this.image.getScaledWidth();
        const scaledImageHeight = this.image.getScaledHeight();
        const imageLeftOffset = (dims.posterInnerBorderWidth - scaledImageWidth) / 2;
        const imageTopOffset = (dims.posterInnerBorderHeight - scaledImageHeight) / 2;

        this.moveImageTo({
            left: dims.posterLeftBorder + imageLeftOffset,
            top: dims.posterTopBorder + imageTopOffset,
        });

        this.canvas.renderAll();
        this.poster.updatePreview();
    }

    centerImageVertical() {
        if (!this.image) {
            return;
        }

        const dims = this.settings.getVirtualDimensions();
        const scaledImageHeight = this.image.getScaledHeight();
        const imageTopOffset = (dims.posterInnerBorderHeight - scaledImageHeight) / 2;

        this.moveImageTo({
            top: dims.posterTopBorder + imageTopOffset,
        });

        this.canvas.renderAll();
        this.poster.updatePreview();
    }

    centerImageHorizontal() {
        if (!this.image) {
            return;
        }

        const dims = this.settings.getVirtualDimensions();
        const scaledImageWidth = this.image.getScaledWidth();
        const imageLeftOffset = (dims.posterInnerBorderWidth - scaledImageWidth) / 2;

        this.moveImageTo({
            left: dims.posterLeftBorder + imageLeftOffset,
        });

        this.canvas.renderAll();
        this.poster.updatePreview();
    }

    updateScaleSlider() {
        if (!this.image) {
            return;
        }

        this.imagePosterRatio = this.image.getScaledWidth() / this.settings.getVirtualDimensions().posterWidth;
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

        this.renderStatus = 'none';
        this.uploadStatus = 'none';
    }

    getAverageColor() {
        if (!this.imgElem) {
            return this.settings.borderColor as string;
        }

        const fac = new FastAverageColor();
        return fac.getColor(this.imgElem, {
            algorithm: 'dominant',
            mode: 'speed',

        }).hex;
    }

    fitImageToBorders() {
        if (!this.image) {
            return;
        }

        const dims = this.settings.getVirtualDimensions();

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

        const dims = this.settings.getVirtualDimensions();

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

        const dims = this.settings.getVirtualDimensions();

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

    alignLeft() {
        if (!this.image) {
            return;
        }

        const dims = this.settings.getVirtualDimensions();
        this.moveImageTo({
            left: dims.posterLeftBorder,
        });

        this.canvas.renderAll();
        this.poster.updatePreview();
    }

    alignRight() {
        if (!this.image) {
            return;
        }

        const dims = this.settings.getVirtualDimensions();
        const scaledImageWidth = this.image.getScaledWidth();
        this.moveImageTo({
            left: dims.posterRightBorder - scaledImageWidth,
        });

        this.canvas.renderAll();
        this.poster.updatePreview();
    }

    alignTop() {
        if (!this.image) {
            return;
        }

        const dims = this.settings.getVirtualDimensions();
        this.moveImageTo({
            top: dims.posterTopBorder,
        });

        this.canvas.renderAll();
        this.poster.updatePreview();
    }

    alignBottom() {
        if (!this.image) {
            return;
        }

        const dims = this.settings.getVirtualDimensions();
        const scaledImageHeight = this.image.getScaledHeight();
        this.moveImageTo({
            top: dims.posterBottomBorder - scaledImageHeight,
        });

        this.canvas.renderAll();
        this.poster.updatePreview();
    }

}

interface ImageCoords {
    left?: number,
    top?: number,
}