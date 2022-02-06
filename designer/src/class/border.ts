import { fabric } from 'fabric';
import { autorun } from 'mobx';
import PosterImage from './image';
import Settings from "./settings";
const tinycolor = require('tinycolor2');

const STEP_SIZE = 0.125;
export { STEP_SIZE };

export default class Border {
    constructor(canvas: fabric.Canvas, settings: Settings, image: PosterImage) {
        this.canvas = canvas;
        this.settings = settings;
        this.posterImage = image;

        this.borderLines = []

        this.setupEffects();
    }

    canvas: fabric.Canvas;
    settings: Settings;
    posterImage: PosterImage;
    borderLines: fabric.Line[];

    get maxBorder(): number {
        const size = this.settings.realPosterDimensions;
        return Math.min(size.width, size.height) / 2 - STEP_SIZE;
    }

    private setupEffects() {
        autorun(() => {
            this.drawBorder();
        }, {
            delay: 50,
        });
    }

    drawBorder() {
        const dims = this.settings.getVirtualDimensions();

        const innerPath = new fabric.Rect({
            left: dims.posterLeftBorder,
            top: dims.posterTopBorder,
            width: dims.posterInnerBorderWidth,
            height: dims.posterInnerBorderHeight,
            absolutePositioned: true,
        });

        if (this.posterImage.image) {
            this.posterImage.image.clipPath = innerPath;
        }

        this.drawLines();
    }

    private drawLines() {
        this.canvas.remove(...this.borderLines);
        this.borderLines = [];

        const dims = this.settings.getVirtualDimensions();

        const invertedBackgroundColor = this.getContrastingColor(this.settings.borderColor) || 'black';
        function createLine(points: number[], lineOptions?: fabric.ILineOptions) {
             const line = new fabric.Line(points, {
                strokeWidth: 1,
                stroke: invertedBackgroundColor,
                opacity: 0.8,
                strokeDashArray: [6, 6],
                // selectable: false,
                // evented: false,
                padding: 5, // increase selectable area
                name: 'border-line',
                hasBorders: false,
                hasControls: false,
                ...lineOptions,
            });

            return line;
        }

        const leftLine = createLine([dims.posterLeftBorder, 0, dims.posterLeftBorder, dims.canvasHeight], { lockMovementY: true });
        const rightLine = createLine([dims.posterRightBorder, 0, dims.posterRightBorder, dims.canvasHeight], { lockMovementY: true });
        const topLine = createLine([0, dims.posterTopBorder, dims.canvasWidth, dims.posterTopBorder], { lockMovementX: true });
        const bottomLine = createLine([0, dims.posterBottomBorder, dims.canvasWidth, dims.posterBottomBorder], { lockMovementX: true });

        leftLine.on('moving', (options) => {
            const target = (options.transform as any).target;
            const dx = target.left - dims.posterLeft;
            const inches = dx * dims.inchesPerPixel;
            this.updateBorder(inches);
            this.drawBorder();
        })

        rightLine.on('moving', (options) => {
            const target = (options.transform as any).target;
            const dx = dims.posterRight - target.left;
            const inches = dx * dims.inchesPerPixel;
            this.updateBorder(inches);
            this.drawBorder();
        })

        topLine.on('moving', (options) => {
            const target = (options.transform as any).target;
            const dx = target.top - dims.posterTop;
            const inches = dx * dims.inchesPerPixel;
            this.updateBorder(inches);
            this.drawBorder();
        })

        bottomLine.on('moving', (options) => {
            const target = (options.transform as any).target;
            const dx = dims.posterBottom - target.top;
            const inches = dx * dims.inchesPerPixel;
            this.updateBorder(inches);
            this.drawBorder();
        })

        this.borderLines = [leftLine, rightLine, topLine, bottomLine];
        this.canvas.add(...this.borderLines);
        this.borderLines.forEach(line => this.canvas.bringToFront(line));
        this.canvas.renderAll();
    }

    private getContrastingColor(color: string): string | null {
        if (!color) {
            return null;
        }

        const bgColor = tinycolor(color);
        if (bgColor.isDark()) {
            return bgColor.spin(180).lighten(75).toHexString();
        }
        else {
            return bgColor.spin(180).darken(75).toHexString();
        }
    }

    updateBorder(value: number) {
        const oldValue = this.settings.border;
        const newValue = this.getConstrainedBorder(value, 0, this.maxBorder);

        if (oldValue.toFixed(3) !== newValue.toFixed(3)) { // only trigger if value changed
            this.settings.border = newValue;
        }
    }

    private getConstrainedBorder(value: number, min: number, max: number) {
        value = value || 0;
        value = Math.round(value / STEP_SIZE) * STEP_SIZE;
        value = clamp(value, min, max);
        return value;
    }

}

function clamp(value: number, min: number, max: number) {
    value = Math.max(min, value);
    value = Math.min(max, value);
    return value;
}