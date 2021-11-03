import { fabric } from 'fabric';
import Settings from './settings';

export default class PosterImage {
    constructor(canvas: fabric.Canvas, settings: Settings) {
        this.canvas = canvas;
        this.settings = settings;

        this.imageInput = document.getElementById("photo-input") as HTMLInputElement;
        this.imageInput.onchange = (e: Event) => this.onImageUpload(e);
        document.getElementById("btn-fit-image")!.onclick = () => this.fitImageToBorders();
        document.getElementById("btn-fill-image")!.onclick = () => this.fillImage();

        let image = new fabric.Image(document.getElementById('cm-img') as HTMLImageElement);
        this.setNewImage(image);
    }

    canvas: fabric.Canvas;
    settings: Settings;
    image: fabric.Image | null;
    imageAspectRatio: number;
    imageInput: HTMLInputElement;

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

    onImageUpload(e: Event) {
        // TODO: start upload to server in background
        let reader = new FileReader();

        reader.onload = (event) => {
            let imgElem = document.getElementById("img-preview") as HTMLImageElement;
            imgElem.src = event.target.result as string;
            imgElem.onload = () => {
                var image = new fabric.Image(imgElem);
                this.setNewImage(image);
            }
        }

        let target = e.target as HTMLInputElement;
        reader.readAsDataURL(target.files[0]);
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

        console.log(dims);

        this.image.set({
            left: dims.posterLeftBorder + imageLeftOffset,
            top: dims.posterTopBorder + imageTopOffset,
        });
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

    fillImage() {
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