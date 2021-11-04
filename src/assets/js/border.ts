import { fabric } from 'fabric';
import PosterImage from './image';
import PosterEventHub from './posterEventHub';
import Settings from "./settings";

export default class Border {
    constructor(canvas: fabric.Canvas, settings: Settings, image: PosterImage, eventHub: PosterEventHub) {
        this.canvas = canvas;
        this.settings = settings;
        this.posterImage = image;

        this.borderLines = []

        eventHub.subscribe('sizeSettingChanged', () => this.drawBorder());
        eventHub.subscribe('orientationSettingChanged', () => this.drawBorder());
        eventHub.subscribe('borderSettingChanged', () => this.drawBorder());
        eventHub.subscribe('imageChanged', () => this.drawBorder());
    }

    canvas: fabric.Canvas;
    settings: Settings;
    posterImage: PosterImage;
    borderLines: fabric.Line[];

    drawBorder() {
        let dims = this.settings.getVirtualDimensions(this.canvas);

        let innerPath = new fabric.Rect({
            left: dims.posterLeftBorder,
            top: dims.posterTopBorder,
            width: dims.posterInnerBorderWidth,
            height: dims.posterInnerBorderHeight,
            absolutePositioned: true,
        });

        this.posterImage.image.clipPath = innerPath;
        this.canvas.renderAll();

        this.drawLines();
    }

    drawLines() {
        this.canvas.remove(...this.borderLines);
        this.borderLines = [];

        let dims = this.settings.getVirtualDimensions(this.canvas);
        let invertedBackgroundColor = this.getInvertedBackgroundColor() || 'black';
        function createLine(startX, startY, endX, endY, lineOptions?) {
            return new fabric.Line([startX, startY, endX, endY], {
                strokeWidth: 1,
                // stroke: 'black',
                stroke: invertedBackgroundColor,
                opacity: 0.8,
                strokeDashArray: [6, 6],
                selectable: false,
                evented: false,
                ...lineOptions,
            });
        }

        let leftLine = createLine(dims.posterLeftBorder, 0, dims.posterLeftBorder, dims.canvasHeight, { lockMovementY: true });
        let rightLine = createLine(dims.posterRightBorder, 0, dims.posterRightBorder, dims.canvasHeight, { lockMovementY: true });
        let topLine = createLine(0, dims.posterTopBorder, dims.canvasWidth, dims.posterTopBorder, { lockMovementX: true });
        let bottomLine = createLine(0, dims.posterBottomBorder, dims.canvasWidth, dims.posterBottomBorder, { lockMovementX: true });

        this.borderLines = [leftLine, rightLine, topLine, bottomLine];
        this.canvas.add(...this.borderLines);
        this.canvas.renderAll();
    }

    getInvertedBackgroundColor(): string{
        let color = this.canvas.backgroundColor;
        if (typeof color !== 'string') {
            return null;
        }

        if (!color){
            return null;
        }

        console.log('color:'+color);

        function invertColor(hex) {
            if (hex.indexOf('#') === 0) {
                hex = hex.slice(1);
            }
            // convert 3-digit hex to 6-digits.
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            if (hex.length !== 6) {
                throw new Error('Invalid HEX color.');
            }
            // invert color components
            var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
                g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
                b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
            // pad each with zeros and return
            return '#' + padZero(r) + padZero(g) + padZero(b);
        }
        
        function padZero(str, len?) {
            len = len || 2;
            var zeros = new Array(len).join('0');
            return (zeros + str).slice(-len);
        }

        return invertColor(color);
    }

}