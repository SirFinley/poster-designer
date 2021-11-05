import { fabric } from 'fabric';
import FastAverageColor from 'fast-average-color';
import PosterEventHub from './posterEventHub';
import Settings from './settings';

export default class PosterImage {
    constructor(canvas: fabric.Canvas, settings: Settings, eventHub: PosterEventHub) {
        this.canvas = canvas;
        this.settings = settings;
        this.eventHub = eventHub;

        this.image = null;
        this.imageAspectRatio = 0;
        this.imgElem = null;

        this.setupEventListeners();
    }

    canvas: fabric.Canvas;
    settings: Settings;
    eventHub: PosterEventHub;

    image: fabric.Image | null;
    imageAspectRatio: number;
    imgElem: HTMLImageElement | null;

    setupEventListeners() {
        // drag and drop upload
        let dropAreas = document.getElementsByClassName("drop-area") as HTMLCollectionOf<HTMLElement>;
        for (let dropArea of dropAreas) {
            let imageInput = document.getElementById("photo-input") as HTMLInputElement;

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, preventDefaults, false);
            })

            function preventDefaults(e: Event) {
                e.preventDefault()
                e.stopPropagation()
            }

            ['dragenter', 'dragover'].forEach(eventName => {
                dropArea.addEventListener(eventName, highlight, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, unhighlight, false);
            })

            dropArea.addEventListener('drop', (e) => {
                let dt = e.dataTransfer!;
                let file = dt.files[0];
                imageInput.files = dt.files;
                this.handleFile(file);
            });

            function highlight() {
                dropArea.classList.add('highlight')
            }

            function unhighlight() {
                dropArea.classList.remove('highlight')
            }

            imageInput.addEventListener('change', (e: Event) => {
                let target = e.target as HTMLInputElement;
                this.handleFile(target.files![0]);
            });
        }

        // fit buttons
        document.getElementById("btn-fit-borders")!.onclick = () => this.fitImageToBorders();
        document.getElementById("btn-fill-borders")!.onclick = () => this.fillBorders();
        document.getElementById("btn-fill-poster")!.onclick = () => this.fillPoster();

        // image scaled
        this.eventHub.subscribe('imageScaled', () => {
            if (!this.image){
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
            this.image.set({
                left: this.image.left! - dx,
                top: this.image.top! - dy,
            })

            this.canvas.renderAll();
        })
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
        })

        if (this.image) {
            this.canvas.remove(this.image);
        }
        this.image = image;
        this.imageAspectRatio = this.image.width! / this.image.height!;
        this.image.on('moving', (e) => this.updateMargins());
        this.image.on('scaling', (e) => this.updateMargins());

        this.fitImageToBorders();
        this.canvas.add(image);
        this.canvas.renderAll();

        let avgColor = this.getAverageColor();
        this.settings.setBorderColor(avgColor);
        this.canvas.setBackgroundColor(avgColor, () => { });

        this.eventHub.triggerEvent('imageChanged');
        this.eventHub.triggerEvent('colorChanged');
    }

    updateMargins() {
        if (!this.image) {
            return;
        }

        let realDims = this.settings.getRealPosterDimensions();
        let vdims = this.settings.getVirtualDimensions();

        let inchesPerPixel = realDims.width / vdims.posterWidth;

        let leftOffset = this.image.left! - vdims.posterLeft;
        let rightOffset = vdims.posterRight - (this.image.left! + this.image.getScaledWidth());

        let topOffset = this.image.top! - vdims.posterTop;
        let bottomOffset = vdims.posterBottom - (this.image.top! + this.image.getScaledHeight());

        let realLeftMargin = leftOffset * inchesPerPixel;
        let realRightMargin = rightOffset * inchesPerPixel;
        let realTopMargin = topOffset * inchesPerPixel;
        let realBottomMargin = bottomOffset * inchesPerPixel;

        this.settings.setMargins(realLeftMargin, realRightMargin, realTopMargin, realBottomMargin);
    }

    handleFile(file: File) {
        // TODO: start upload to server in background
        let reader = new FileReader();

        reader.onload = (event) => {
            let imgElem = document.getElementById("img-preview") as HTMLImageElement;
            imgElem.src = event.target!.result as string;
            imgElem.onload = () => {
                var image = new fabric.Image(imgElem);
                this.setNewImage(image);
            };
            this.imgElem = imgElem;
        }

        reader.readAsDataURL(file);
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

        let scaledImageWidth = this.image.getScaledWidth();
        let scaledImageHeight = this.image.getScaledHeight();
        let imageLeftOffset = (dims.posterInnerBorderWidth - scaledImageWidth) / 2;
        let imageTopOffset = (dims.posterInnerBorderHeight - scaledImageHeight) / 2;

        this.image.set({
            left: dims.posterLeftBorder + imageLeftOffset,
            top: dims.posterTopBorder + imageTopOffset,
        });

        this.canvas.renderAll();

        this.updateMargins();
    }

    fitImageToCanvas() {
        if (!this.image) {
            return;
        }

        let dims = this.settings.getVirtualDimensions();

        if (this.imageAspectRatio >= dims.posterAspectRatio) { // image wider than canvas
            this.scaleToWidth(dims.posterWidth);
        }
        else { // image taller than poster
            this.scaleToHeight(dims.posterHeight);
        }

        let scaledImageWidth = this.image.getScaledWidth();
        let scaledImageHeight = this.image.getScaledHeight();
        let imageHorizontalMargin = (dims.posterWidth - scaledImageWidth) / 2;
        let imageVerticalMargin = (dims.posterHeight - scaledImageHeight) / 2;

        this.image.set({
            left: dims.posterLeft + imageHorizontalMargin,
            top: dims.posterTop + imageVerticalMargin,
        });
        this.canvas.renderAll();
        this.updateMargins();
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

        let scaledImageWidth = this.image.getScaledWidth();
        let scaledImageHeight = this.image.getScaledHeight();
        let imageHorizontalMargin = (dims.posterInnerBorderWidth - scaledImageWidth) / 2;
        let imageVerticalMargin = (dims.posterInnerBorderHeight - scaledImageHeight) / 2;

        this.image.set({
            left: dims.posterLeftBorder + imageHorizontalMargin,
            top: dims.posterTopBorder + imageVerticalMargin,
        });
        this.canvas.renderAll();
        this.updateMargins();
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

        let scaledImageWidth = this.image.getScaledWidth();
        let scaledImageHeight = this.image.getScaledHeight();
        let imageHorizontalMargin = (dims.posterWidth - scaledImageWidth) / 2;
        let imageVerticalMargin = (dims.posterHeight - scaledImageHeight) / 2;

        this.image.set({
            left: dims.posterLeft + imageHorizontalMargin,
            top: dims.posterTop + imageVerticalMargin,
        });
        this.canvas.renderAll();
        this.updateMargins();
    }

    scaleToWidth(width: number) {
        if (!this.image) {
            return;
        }

        this.image.scale(width / this.image.width!);

        let dims = this.settings.getVirtualDimensions();
        this.settings.setImageScale(this.image.getScaledWidth() / dims.posterWidth);
    }

    scaleToHeight(height: number) {
        if (!this.image) {
            return;
        }

        this.image.scale(height / this.image.height!);

        let dims = this.settings.getVirtualDimensions();
        this.settings.setImageScale(this.image.getScaledWidth() / dims.posterWidth);
    }

}