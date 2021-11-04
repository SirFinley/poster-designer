import { fabric } from 'fabric';
import FastAverageColor from 'fast-average-color';
import PosterEventHub from './posterEventHub';
import Settings from './settings';

export default class PosterImage {
    constructor(canvas: fabric.Canvas, settings: Settings, eventHub: PosterEventHub) {
        this.canvas = canvas;
        this.settings = settings;
        this.eventHub = eventHub;

        this.setupEventListeners();

        // TODO: remove this - load test image on start
        let image = new fabric.Image(document.getElementById('cm-img') as HTMLImageElement);
        this.setNewImage(image);
        // TODO: remove this - load test image on start
    }

    canvas: fabric.Canvas;
    settings: Settings;
    eventHub: PosterEventHub;

    image: fabric.Image | null;
    imageAspectRatio: number;
    imgElem: HTMLImageElement;

    setupEventListeners() {
        // drag and drop upload
        let dropArea = document.getElementById("drop-area") as HTMLElement;
        let imageInput = document.getElementById("photo-input") as HTMLInputElement;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        })

        function preventDefaults(e) {
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
            let dt = e.dataTransfer;
            let file = dt.files[0];
            imageInput.files = dt.files;
            this.handleFile(file);
        });

        function highlight(e) {
            dropArea.classList.add('highlight')
        }

        function unhighlight(e) {
            dropArea.classList.remove('highlight')
        }

        imageInput.addEventListener('change', (e: Event) => {
            let target = e.target as HTMLInputElement;
            this.handleFile(target.files[0]);
        });

        // fit buttons
        document.getElementById("btn-fit-borders")!.onclick = () => this.fitImageToBorders();
        document.getElementById("btn-fill-borders")!.onclick = () => this.fillBorders();
        document.getElementById("btn-fill-poster")!.onclick = () => this.fillPoster();
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

        this.canvas.remove(this.image);
        this.image = image;
        this.imageAspectRatio = this.image.width! / this.image.height!;
        this.image.on('moving', (e) => this.updateMargins());
        this.image.on('scaling', (e) => this.updateMargins());

        this.fitImageToBorders();
        this.canvas.add(image);
        this.canvas.renderAll();

        this.eventHub.triggerEvent('imageChanged');
    }

    updateMargins() {
        if (!this.image) {
            return;
        }

        let realDims = this.settings.getRealPosterDimensions();
        let vdims = this.settings.getVirtualDimensions(this.canvas);

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
            imgElem.src = event.target.result as string;
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
            return this.canvas.backgroundColor;
        }

        let fac = new FastAverageColor();
        return fac.getColor(this.imgElem, {
            algorithm: 'dominant',
            mode: 'speed',

        }).hex;
    }

    fitImageToBorders() {
        let dims = this.settings.getVirtualDimensions(this.canvas);

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

        let avgColor = this.getAverageColor();
        this.canvas.setBackgroundColor(avgColor, null);
        this.canvas.renderAll();

        this.updateMargins();
    }

    fitImageToCanvas() {
        let dims = this.settings.getVirtualDimensions(this.canvas);

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
        let dims = this.settings.getVirtualDimensions(this.canvas);

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
        let dims = this.settings.getVirtualDimensions(this.canvas);

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
        this.image.scale(width / this.image.width!);
    }

    scaleToHeight(height: number) {
        this.image.scale(height / this.image.height!);
    }

}