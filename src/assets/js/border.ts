import { fabric } from 'fabric';
import PosterImage from './image';
import PosterEventHub from './posterEventHub';
import Settings from "./settings";

export default class Border {
    constructor(canvas: fabric.Canvas, settings: Settings, image: PosterImage, eventHub: PosterEventHub) {
        this.canvas = canvas;
        this.settings = settings;
        this.posterImage = image;

        eventHub.subscribe('sizeSettingChanged', () => this.setBorder());
        eventHub.subscribe('orientationSettingChanged', () => this.setBorder());
        eventHub.subscribe('borderSettingChanged', () => this.setBorder());
        eventHub.subscribe('imageChanged', () => this.setBorder());
    }

    canvas: fabric.Canvas;
    settings: Settings;
    posterImage: PosterImage;

    setBorder() {
        let dims = this.settings.getVirtualDimensions(this.canvas);
        console.log(dims);

        let innerPath = new fabric.Rect({
            left: dims.posterLeftBorder,
            top: dims.posterTopBorder,
            width: dims.posterInnerBorderWidth,
            height: dims.posterInnerBorderHeight,
            absolutePositioned: true,
        });

        this.posterImage.image.clipPath = innerPath;
        this.canvas.renderAll();
    }

}