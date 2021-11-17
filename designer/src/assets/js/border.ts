const tinycolor = require('tinycolor2');
import { fabric } from 'fabric';
import PosterImage from './image';
import NoUiSlider from './noUiSlider';
import PosterEventHub from './posterEventHub';
import Settings from "./settings";

export default class Border {
    constructor(canvas: fabric.Canvas, settings: Settings, image: PosterImage, eventHub: PosterEventHub) {
        this.canvas = canvas;
        this.settings = settings;
        this.posterImage = image;
        this.eventHub = eventHub;

        this.borderLines = []
        this.bordersLinked = true;
        this.borderLockedValues = [0, 0];

        this.sideBorderInput = new NoUiSlider("side-border", 0, 10, 0, 0.125);
        this.sideBorderValueDisplay = document.getElementById("side-border-value") as HTMLElement;

        this.verticalBorderInput = new NoUiSlider("vertical-border", 0, 10, 0, 0.125);
        this.verticalBorderValueDisplay = document.getElementById("vertical-border-value") as HTMLElement;

        this.setupEventListeners(eventHub);
        this.setInputConstraints();
    }

    canvas: fabric.Canvas;
    settings: Settings;
    posterImage: PosterImage;
    borderLines: fabric.Line[];
    eventHub: PosterEventHub;

    bordersLinked: boolean;
    borderLockedValues: number[];
    sideBorderInput: NoUiSlider;
    sideBorderValueDisplay: HTMLElement;
    verticalBorderInput: NoUiSlider;
    verticalBorderValueDisplay: HTMLElement;

    private setupEventListeners(eventHub: PosterEventHub) {
        const self = this;

        eventHub.subscribe('sizeSettingChanged', () => this.drawBorder());
        eventHub.subscribe('orientationSettingChanged', () => this.drawBorder());
        eventHub.subscribe('borderSettingChanged', () => this.drawBorder());
        eventHub.subscribe('imageChanged', () => this.drawBorder());
        eventHub.subscribe('colorChanged', () => {
            this.canvas.backgroundColor = this.settings.borderColor;
            this.drawLines();
        });

        // borders
        this.sideBorderInput.slider.on('slide', () => {
            let value = self.sideBorderInput.get();
            self.updateSideBorder(value);
            self.eventHub.triggerEvent('borderSettingChanged');
        });
        this.verticalBorderInput.slider.on('slide', (thing) => {
            let value = self.verticalBorderInput.get();
            this.updateVerticalBorder(value);
            self.eventHub.triggerEvent('borderSettingChanged');
        });

        // border link
        let linkButtons = document.getElementsByClassName('btn-border-link');
        for (let linkButton of linkButtons) {
            (linkButton as HTMLButtonElement).addEventListener('click', () => {
                this.bordersLinked = !this.bordersLinked;

                // update link/unlink buttons
                for (let icon of document.getElementsByClassName('border-link')) {
                    if (this.bordersLinked) {
                        icon.classList.remove('fa-unlink');
                        icon.classList.add('fa-link');
                    }
                    else {
                        icon.classList.remove('fa-link');
                        icon.classList.add('fa-unlink');
                    }
                }
            });
        }

        // update border
        this.eventHub.subscribe('sizeSettingChanged', refreshBorderValues);
        this.eventHub.subscribe('orientationSettingChanged', refreshBorderValues);
        function refreshBorderValues() {
            self.setInputConstraints();
            self.setSideBorderInput(self.settings.sideBorder);
            self.setVerticalBorderInput(self.settings.verticalBorder);
        }
    }

    drawBorder() {
        if (!this.posterImage.image) {
            return;
        }

        let dims = this.settings.getVirtualDimensions();

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

    private drawLines() {
        this.canvas.remove(...this.borderLines);
        this.borderLines = [];

        let dims = this.settings.getVirtualDimensions();

        let invertedBackgroundColor = this.getContrastingColor(this.settings.borderColor) || 'black';
        function createLine(points: number[], lineOptions?: fabric.ILineOptions) {
            return new fabric.Line(points, {
                strokeWidth: 1,
                stroke: invertedBackgroundColor,
                opacity: 0.8,
                strokeDashArray: [6, 6],
                // selectable: false,
                // evented: false,
                padding: 5, // increase selectable area
                ...lineOptions,
            });
        }

        let leftLine = createLine([dims.posterLeftBorder, 0, dims.posterLeftBorder, dims.canvasHeight], { lockMovementY: true });
        let rightLine = createLine([dims.posterRightBorder, 0, dims.posterRightBorder, dims.canvasHeight], { lockMovementY: true });
        let topLine = createLine([0, dims.posterTopBorder, dims.canvasWidth, dims.posterTopBorder], { lockMovementX: true });
        let bottomLine = createLine([0, dims.posterBottomBorder, dims.canvasWidth, dims.posterBottomBorder], { lockMovementX: true });

        leftLine.on('moving', (options) => {
            let target = (options.transform as any).target;
            let dx = target.left - dims.posterLeft;
            let inches = dx * dims.inchesPerPixel;
            this.updateSideBorder(inches);
            this.drawBorder();
        })

        rightLine.on('moving', (options) => {
            let target = (options.transform as any).target;
            let dx = dims.posterRight - target.left;
            let inches = dx * dims.inchesPerPixel;
            this.updateSideBorder(inches);
            this.drawBorder();
        })

        topLine.on('moving', (options) => {
            let target = (options.transform as any).target;
            let dx = target.top - dims.posterTop;
            let inches = dx * dims.inchesPerPixel;
            this.updateVerticalBorder(inches);
            this.drawBorder();
        })

        bottomLine.on('moving', (options) => {
            let target = (options.transform as any).target;
            let dx = dims.posterBottom - target.top;
            let inches = dx * dims.inchesPerPixel;
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

        let bgColor = tinycolor(color);
        if (bgColor.isDark()) {
            return bgColor.spin(180).lighten(75).toHexString();
        }
        else {
            return bgColor.spin(180).darken(75).toHexString();
        }
    }

    private setInputConstraints() {
        let size = this.settings.getRealPosterDimensions();
        let maxSideBorder = size.width / 2 - 0.125;
        let maxVerticalBorder = size.height / 2 - 0.125;

        this.sideBorderInput.setMax(maxSideBorder);
        this.verticalBorderInput.setMax(maxVerticalBorder);

        let maxInches = Math.max(maxSideBorder, maxVerticalBorder);
        let maxSliderWidth = document.getElementById('hidden-border')!.offsetWidth;

        let pixelsPerInch = maxSliderWidth / maxInches;

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
        this.sideBorderValueDisplay.innerText = `Side Border: ${value}"`;
    }

    private setVerticalBorderInput(value: number) {
        value = value || 0;
        value = Math.round(value / 0.125) * 0.125;
        value = clamp(value, this.verticalBorderInput.getMin(), this.verticalBorderInput.getMax());

        this.settings.verticalBorder = value;
        this.verticalBorderInput.set(value);
        this.verticalBorderValueDisplay.innerText = `Top/Bottom Border: ${value}"`;
    }

    private crossUpdate(value: number, slider: NoUiSlider, callback: (_: number) => void) {

        // If the sliders aren't interlocked, don't
        // cross-update.
        if (!this.bordersLinked) return;

        // Select whether to increase or decrease
        // the other slider value.
        var a = this.sideBorderInput === slider ? 0 : 1;

        // Invert a
        var b = a ? 0 : 1;

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