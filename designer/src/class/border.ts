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
        this.bordersLinked = true;

        this.setupEffects();
    }

    canvas: fabric.Canvas;
    settings: Settings;
    posterImage: PosterImage;
    borderLines: fabric.Line[];

    bordersLinked: boolean;

    get maxSide(): number {
        const size = this.settings.realPosterDimensions;
        return size.width / 2 - STEP_SIZE;
    }

    get maxVertical(): number {
        const size = this.settings.realPosterDimensions;
        return size.height / 2 - STEP_SIZE;
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
            return new fabric.Line(points, {
                strokeWidth: 1,
                stroke: invertedBackgroundColor,
                opacity: 0.8,
                strokeDashArray: [6, 6],
                // selectable: false,
                // evented: false,
                padding: 5, // increase selectable area
                name: 'border-line',
                ...lineOptions,
            });
        }

        const leftLine = createLine([dims.posterLeftBorder, 0, dims.posterLeftBorder, dims.canvasHeight], { lockMovementY: true });
        const rightLine = createLine([dims.posterRightBorder, 0, dims.posterRightBorder, dims.canvasHeight], { lockMovementY: true });
        const topLine = createLine([0, dims.posterTopBorder, dims.canvasWidth, dims.posterTopBorder], { lockMovementX: true });
        const bottomLine = createLine([0, dims.posterBottomBorder, dims.canvasWidth, dims.posterBottomBorder], { lockMovementX: true });

        leftLine.on('moving', (options) => {
            const target = (options.transform as any).target;
            const dx = target.left - dims.posterLeft;
            const inches = dx * dims.inchesPerPixel;
            this.updateSideBorder(inches);
            this.drawBorder();
        })

        rightLine.on('moving', (options) => {
            const target = (options.transform as any).target;
            const dx = dims.posterRight - target.left;
            const inches = dx * dims.inchesPerPixel;
            this.updateSideBorder(inches);
            this.drawBorder();
        })

        topLine.on('moving', (options) => {
            const target = (options.transform as any).target;
            const dx = target.top - dims.posterTop;
            const inches = dx * dims.inchesPerPixel;
            this.updateVerticalBorder(inches);
            this.drawBorder();
        })

        bottomLine.on('moving', (options) => {
            const target = (options.transform as any).target;
            const dx = dims.posterBottom - target.top;
            const inches = dx * dims.inchesPerPixel;
            this.updateVerticalBorder(inches);
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

    updateSideBorder(value: number) {
        this.setSideBorderInput(value);
    }

    updateVerticalBorder(value: number) {
        this.setVerticalBorderInput(value);
    }

    private setSideBorderInput(value: number) {
        const oldValue = this.settings.sideBorder;
        const newValue = this.getConstrainedBorder(value, 0, this.maxSide);

        if (oldValue.toFixed(3) !== newValue.toFixed(3)) { // only trigger if value changed
            this.settings.sideBorder = newValue;
            this.crossUpdate(oldValue, newValue, false);
        }
    }

    private setVerticalBorderInput(value: number) {
        const oldValue = this.settings.verticalBorder;
        const newValue = this.getConstrainedBorder(value, 0, this.maxVertical);

        if (oldValue.toFixed(3) !== newValue.toFixed(3)) { // only trigger if value changed
            this.settings.verticalBorder = newValue;
            this.crossUpdate(oldValue, newValue, true);
        }
    }

    private getConstrainedBorder(value: number, min: number, max: number) {
        value = value || 0;
        value = Math.round(value / STEP_SIZE) * STEP_SIZE;
        value = clamp(value, min, max);
        return value;
    }

    private crossUpdate(oldValue: number, newValue: number, isVertical: boolean) {
        if (!this.bordersLinked) {
            return;
        }

        if (isVertical) {
            const offset = newValue - oldValue;
            this.settings.sideBorder = this.getConstrainedBorder(this.settings.sideBorder + offset, 0, this.maxSide);
        }
        else {
            const offset = newValue - oldValue;
            this.settings.verticalBorder = this.getConstrainedBorder(this.settings.verticalBorder + offset, 0, this.maxVertical);
        }
    }

}

function clamp(value: number, min: number, max: number) {
    value = Math.max(min, value);
    value = Math.min(max, value);
    return value;
}