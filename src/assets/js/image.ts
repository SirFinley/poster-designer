import { fabric } from 'fabric';
import Settings from './settings';

export default class PosterImage {
    constructor(canvas: fabric.Canvas, settings: Settings) {
        this.canvas = canvas;
        this.settings = settings;

        this.imageInput = document.getElementById("photo-input") as HTMLInputElement;
        this.imageInput.onchange = (e: Event) => this.onImageUpload(e);
        document.getElementById("btn-fit-image")!.onclick = () => this.fitImage();
        document.getElementById("btn-fill-image")!.onclick = () => this.fillImage();

        let image = new fabric.Image(document.getElementById('cm-img') as HTMLImageElement);
        this.setNewImage(image);
    }

    canvas: fabric.Canvas;
    settings: Settings;
    image: fabric.Image | null;
    imageAspectRatio: number;
    imageInput: HTMLInputElement;

    setNewImage(image: fabric.Image){
        image.setControlsVisibility({
            mb: false,
            ml: false,
            mr: false,
            mt: false
        });

        this.canvas.remove(this.image);
        this.image = image;
        this.imageAspectRatio = this.image.width! / this.image.height!;

        this.fitImage();
        this.canvas.add(image);
        this.canvas.renderAll();
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

    fitImage() {
        let dims = this.settings.getVirtualDimensions(this.canvas);

        if (this.imageAspectRatio >= dims.posterAspectRatio) { // image wider than canvas
            this.scaleToWidth(dims.posterWidth);
        }
        else { // image taller than poster
            this.scaleToHeight(dims.posterHeight);
        }

        let scaledImageWidth = this.image.width! * this.image.scaleX!;
        let scaledImageHeight = this.image.height! * this.image.scaleY!;
        let imageHorizontalMargin = (dims.posterWidth - scaledImageWidth) / 2;
        let imageVerticalMargin = (dims.posterHeight - scaledImageHeight) / 2;

        this.image.set({
            left: dims.posterLeft + imageHorizontalMargin,
            top: dims.posterTop + imageVerticalMargin,
        });
        this.canvas.renderAll();
    }

    fillImage() {
        let dims = this.settings.getVirtualDimensions(this.canvas);

        if (this.imageAspectRatio >= dims.posterAspectRatio) { // image wider than canvas
            this.scaleToHeight(dims.posterHeight);
        }
        else { // image taller than poster
            this.scaleToWidth(dims.posterWidth);
        }

        let scaledImageWidth = this.image.width! * this.image.scaleX!;
        let scaledImageHeight = this.image.height! * this.image.scaleY!;
        let imageHorizontalMargin = (dims.posterWidth - scaledImageWidth) / 2;
        let imageVerticalMargin = (dims.posterHeight - scaledImageHeight) / 2;

        this.image.set({
            left: dims.posterLeft + imageHorizontalMargin,
            top: dims.posterTop + imageVerticalMargin,
        });
        this.canvas.renderAll();
    }

    scaleToWidth(width: number) {
        this.image.scale(width / this.image.width!);
    }

    scaleToHeight(height: number) {
        this.image.scale(height / this.image.height!);
    }

}