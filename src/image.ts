import { fabric } from 'fabric';
import Settings from './settings';

export default class PosterImage {
    constructor(canvas: fabric.Canvas, settings: Settings) {
        this.canvas = canvas;
        this.settings = settings;

        document.getElementById("btn-fit-image")!.onclick = () => this.fitImage();
        document.getElementById("btn-fill-image")!.onclick = () => this.fillImage();

        // TODO: load image from uploaded url
        // let imgUrl = '';
        // fabric.Image.fromURL(imgUrl, (oImg) => {
        //     this.canvas.add(oImg);
        // });
        this.image = new fabric.Image(document.getElementById('cm-img') as HTMLImageElement);
        this.imageAspectRatio = this.image.width! / this.image.height!;
        this.image.setControlsVisibility({
            mb: false,
            ml: false,
            mr: false,
            mt: false
        });

        this.canvas.add(this.image);
    }

    canvas: fabric.Canvas;
    settings: Settings;
    image: fabric.Image;
    imageAspectRatio: number;

    fitImage() {
        console.log('fit image');
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
        console.log('fill image');
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