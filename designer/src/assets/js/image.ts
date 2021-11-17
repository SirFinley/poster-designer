import { fabric } from 'fabric';
import FastAverageColor from 'fast-average-color';
import ImageUploader from './imageUploader';
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
        this.imageUploader = new ImageUploader(this.settings, this.eventHub)

        this.imageInput = document.getElementById("photo-input") as HTMLInputElement;

        this.setupEventListeners();
    }

    canvas: fabric.Canvas;
    settings: Settings;
    eventHub: PosterEventHub;
    imageInput: HTMLInputElement;
    imageUploader: ImageUploader;

    image: fabric.Image | null;
    imageAspectRatio: number;
    imgElem: HTMLImageElement | null;

    setupEventListeners() {
        // drag and drop upload
        let dropAreas = document.getElementsByClassName("drop-area") as HTMLCollectionOf<HTMLElement>;
        for (let dropArea of dropAreas) {
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
                this.imageInput.files = dt.files;
                this.handleFile(file);
            });

            function highlight() {
                dropArea.classList.add('highlight')
            }

            function unhighlight() {
                dropArea.classList.remove('highlight')
            }

            this.imageInput.addEventListener('change', (e: Event) => {
                let target = e.target as HTMLInputElement;
                this.handleFile(target.files![0]);
            });
        }

        // fit buttons
        document.getElementById("btn-fit-borders")!.onclick = () => this.fitImageToBorders();
        document.getElementById("btn-fill-borders")!.onclick = () => this.fillBorders();
        document.getElementById("btn-fill-poster")!.onclick = () => this.fillPoster();
        document.getElementById("btn-center-image")!.onclick = () => this.centerImage();
        document.getElementById("btn-center-image-vertical")!.onclick = () => this.centerImageVertical();
        document.getElementById("btn-center-image-horizontal")!.onclick = () => this.centerImageHorizontal();

        // image scaled
        this.eventHub.subscribe('imageScaled', () => {
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
            this.image.set({
                left: this.image.left! - dx,
                top: this.image.top! - dy,
            })

            this.canvas.renderAll();
        });

        this.eventHub.subscribe('sizeSettingChanged', () => this.updateScaleSlider());
        this.eventHub.subscribe('orientationSettingChanged', () => this.updateScaleSlider());
        this.eventHub.subscribe('imageUploadCancelled', () => this.clearImage());
        this.eventHub.subscribe('imageCleared', () => this.clearImage());
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
        this.image.on('scaling', (e) => {
            this.updateScaleSlider();
        });


        this.fitImageToBorders();
        this.canvas.add(image);
        this.canvas.renderAll();

        let avgColor = this.getAverageColor();
        this.settings.setBorderColor(avgColor);
        this.canvas.setBackgroundColor(avgColor, () => { });

        this.eventHub.triggerEvent('imageChanged');
        this.eventHub.triggerEvent('colorChanged');
    }

    centerImage() {
        console.log('center image');
        
        if (!this.image) {
            return;
        }

        let dims = this.settings.getVirtualDimensions();
        let scaledImageWidth = this.image.getScaledWidth();
        let scaledImageHeight = this.image.getScaledHeight();
        let imageLeftOffset = (dims.posterInnerBorderWidth - scaledImageWidth) / 2;
        let imageTopOffset = (dims.posterInnerBorderHeight - scaledImageHeight) / 2;

        this.image.set({
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

        this.image.set({
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

        this.image.set({
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

    handleFile(file: File) {
        // not an image
        if (!/image\//.test(file.type)) {
            return;
        }

        this.imageUploader.start(file);

        let reader = new FileReader();

        this.eventHub.subscribe('imageUploadCancelled', abortReader);
        this.eventHub.subscribe('imageCleared', abortReader);
        function abortReader() {
            reader.abort();
        }

        reader.onload = (event) => {
            this.eventHub.remove('imageUploadCancelled', abortReader);
            this.eventHub.remove('imageCleared', abortReader);

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

    clearImage() {
        if (this.image) {
            this.canvas.remove(this.image);
            this.image = null;
            this.canvas.backgroundColor = 'white';
            this.canvas.renderAll();
        }

        this.imageInput.value = '';
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