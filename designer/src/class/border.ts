import { fabric } from 'fabric';
import PosterImage from './image';
import NoUiSlider from './noUiSlider';
import eventHub from './posterEventHub';
import Settings from "./settings";
const tinycolor = require('tinycolor2');

export default class Border {
    constructor(canvas: fabric.Canvas, settings: Settings, image: PosterImage) {
        this.canvas = canvas;
        this.settings = settings;
        this.posterImage = image;

        this.borderLines = []
        this.bordersLinked = true;
        this.borderLockedValues = [0, 0];

        this.sideBorderInput = new NoUiSlider(document.createElement('div'), 0, 10, 0, 0.125);
        this.verticalBorderInput = new NoUiSlider(document.createElement('div'), 0, 10, 0, 0.125);
    }

    canvas: fabric.Canvas;
    settings: Settings;
    posterImage: PosterImage;
    borderLines: fabric.Line[];

    bordersLinked: boolean;
    borderLockedValues: number[];
    sideBorderInput: NoUiSlider;
    verticalBorderInput: NoUiSlider;
    fullSlider?: HTMLElement;

    initialize() {
        this.setupEventListeners();
        this.setInputConstraints();
    }

    private setupEventListeners() {
        eventHub.subscribe('sizeSettingChanged', () => this.drawBorder());
        eventHub.subscribe('orientationSettingChanged', () => this.drawBorder());
        eventHub.subscribe('borderSettingChanged', () => this.drawBorder());
        eventHub.subscribe('imageChanged', () => this.drawBorder());
        eventHub.subscribe('colorChanged', () => {
            this.canvas.backgroundColor = this.settings.borderColor;
            this.drawLines();
        });

        // update border
        const refreshBorderValues = () => {
            this.setInputConstraints();
            this.setSideBorderInput(this.settings.sideBorder);
            this.setVerticalBorderInput(this.settings.verticalBorder);
        }
        eventHub.subscribe('sizeSettingChanged', refreshBorderValues);
        eventHub.subscribe('orientationSettingChanged', refreshBorderValues);
    }

    onSideBorderSlide() {
        const value = this.sideBorderInput.get();
        this.updateSideBorder(value);
        eventHub.triggerEvent('borderSettingChanged');
    };

    onVerticalBorderSlide() {
        const value = this.verticalBorderInput.get();
        this.updateVerticalBorder(value);
        eventHub.triggerEvent('borderSettingChanged');
    };

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
        this.canvas.renderAll();

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

    private setInputConstraints() {
        if (!this.fullSlider) {
            return;
        }

        const size = this.settings.getRealPosterDimensions();
        const maxSideBorder = size.width / 2 - 0.125;
        const maxVerticalBorder = size.height / 2 - 0.125;

        this.sideBorderInput.setMax(maxSideBorder);
        this.verticalBorderInput.setMax(maxVerticalBorder);

        const maxInches = Math.max(maxSideBorder, maxVerticalBorder);
        const maxSliderWidth = this.fullSlider.offsetWidth;

        const pixelsPerInch = maxSliderWidth / maxInches;

        if (maxSideBorder > maxVerticalBorder) {
            this.sideBorderInput.setUiWidth(maxSliderWidth);
            this.verticalBorderInput.setUiWidth(maxVerticalBorder * pixelsPerInch);
        }
        else {
            this.verticalBorderInput.setUiWidth(maxSliderWidth);
            this.sideBorderInput.setUiWidth(maxSideBorder * pixelsPerInch);
        }
    }

    private updateSideBorder(value: number) {
        this.setSideBorderInput(value);
        value = this.sideBorderInput.get();

        this.crossUpdate(value, this.verticalBorderInput, (linkedValue) => this.setVerticalBorderInput(linkedValue));
        this.setLockedValues();
    }

    private updateVerticalBorder(value: number) {
        this.setVerticalBorderInput(value);
        value = this.verticalBorderInput.get();

        this.crossUpdate(value, this.sideBorderInput, (linkedValue) => this.setSideBorderInput(linkedValue));
        this.setLockedValues();
    }

    private setLockedValues() {
        this.borderLockedValues = [
            Number(this.sideBorderInput.get()),
            Number(this.verticalBorderInput.get())
        ];
    }

    private setSideBorderInput(value: number) {
        value = value || 0;
        value = Math.round(value / 0.125) * 0.125;
        value = clamp(value, this.sideBorderInput.getMin(), this.sideBorderInput.getMax());

        this.settings.sideBorder = value;
        this.sideBorderInput.set(value);
        eventHub.triggerEvent('borderSettingChanged');
    }

    private setVerticalBorderInput(value: number) {
        value = value || 0;
        value = Math.round(value / 0.125) * 0.125;
        value = clamp(value, this.verticalBorderInput.getMin(), this.verticalBorderInput.getMax());

        this.settings.verticalBorder = value;
        this.verticalBorderInput.set(value);
        eventHub.triggerEvent('borderSettingChanged');
    }

    private crossUpdate(value: number, slider: NoUiSlider, callback: (_: number) => void) {

        // If the sliders aren't interlocked, don't
        // cross-update.
        if (!this.bordersLinked) return;

        // Select whether to increase or decrease
        // the other slider value.
        const a = this.sideBorderInput === slider ? 0 : 1;

        // Invert a
        const b = a ? 0 : 1;

        // Offset the slider value.
        value -= this.borderLockedValues[b] - this.borderLockedValues[a];

        // Set the value
        slider.set(value);
        callback(value);
    }

}

function clamp(value: number, min: number, max: number) {
    value = Math.max(min, value);
    value = Math.min(max, value);
    return value;
}