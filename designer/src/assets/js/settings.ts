import noUiSlider, { API as NoUiAPI} from 'nouislider';
import 'nouislider/dist/nouislider.css';

import PosterEventHub from "./posterEventHub";
import VirtualDimensions from "./virtualDimensions";

export default class Settings {
    canvas: fabric.Canvas;
    eventHub: PosterEventHub;

    orientation: OrientationOptions;
    size: SizeOptions;

    sideBorder: number;
    verticalBorder: number;

    orientationInput: HTMLInputElement;
    sizeInput: HTMLInputElement;

    sideBorderInput: NoUiSlider;
    sideBorderValueDisplay: HTMLElement;
    verticalBorderInput: NoUiSlider;
    verticalBorderValueDisplay: HTMLElement;

    colorInput: HTMLInputElement;
    borderColor: string;

    imageScaleInput: NoUiSlider;
    imageScaleValueDisplay: HTMLElement;
    imageScaleValue: number;

    constructor(canvas: fabric.Canvas, eventHub: PosterEventHub) {
        this.canvas = canvas;
        this.eventHub = eventHub;

        this.orientation = 'portrait';
        this.size = '8.5x11';
        this.sideBorder = 0;
        this.verticalBorder = 0;
        this.borderColor = '#ffffff';
        this.imageScaleValue = 1;

        this.orientationInput = document.getElementById("orientation-input") as HTMLInputElement;
        this.sizeInput = document.getElementById("size-input") as HTMLInputElement;

        this.sideBorderInput = new NoUiSlider("side-border", 0, 10, 0, 0.125);
        this.sideBorderValueDisplay = document.getElementById("side-border-value") as HTMLElement;

        this.verticalBorderInput = new NoUiSlider("vertical-border", 0, 10, 0, 0.125);
        this.verticalBorderValueDisplay = document.getElementById("vertical-border-value") as HTMLElement;
        this.colorInput = document.getElementById("border-color") as HTMLInputElement;
        this.imageScaleInput = new NoUiSlider("image-scale", 0, 3, 1, 0.001);
        this.imageScaleValueDisplay = document.getElementById("image-scale-value") as HTMLInputElement;

        this.initializeEventListeners();
        this.populateSizeInputOptions();
        this.setInputConstraints();
    }

    setInputConstraints() {
        let size = this.getRealPosterDimensions();
        let maxSideBorder = size.width / 2 - 0.125;
        let maxVerticalBorder = size.height / 2 - 0.125;

        this.sideBorderInput.setMax(maxSideBorder);
        this.verticalBorderInput.setMax(maxVerticalBorder);

        let maxInches = Math.max(maxSideBorder, maxVerticalBorder);
        let maxSliderWidth = document.getElementById('hidden-border')!.parentElement!.offsetWidth;

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

    initializeEventListeners() {
        let self = this;

        // borders
        this.sideBorderInput.slider.on('slide', onBorderInput);
        this.verticalBorderInput.slider.on('slide', onBorderInput);
        function onBorderInput(this: NoUiAPI) {
            let value = parseFloat(this.get() as string);
            if (this.target.id === 'side-border') {
                self.sideBorder = value;
                self.sideBorderValueDisplay.innerText = `Side Border: ${value}"`;
            }
            else if (this.target.id === 'vertical-border') {
                self.verticalBorder = value;
                self.verticalBorderValueDisplay.innerText = `Top/Bottom Border: ${value}"`;
            }

            self.eventHub.triggerEvent('borderSettingChanged');
        }

        // color
        this.colorInput.addEventListener('input', onBorderColorInput);
        function onBorderColorInput(this: HTMLInputElement, e: Event) {
            self.borderColor = this.value;
            self.eventHub.triggerEvent('colorChanged');
        }

        // image scale
        this.imageScaleInput.slider.on('slide', onScaleImage);
        function onScaleImage(this: NoUiAPI) {
            let value = fromSliderScaleValue(this.get() as string);
            self.setImageScale(value);
            self.eventHub.triggerEvent('imageScaled');
        }

        // size
        this.sizeInput.addEventListener('change', onSizeInput);
        function onSizeInput(this: HTMLInputElement, e: Event) {
            self.size = this.value as SizeOptions;
            self.eventHub.triggerEvent('sizeSettingChanged');
        }

        // orientation
        this.orientationInput.addEventListener('change', onOrientationInput);
        function onOrientationInput(this: HTMLInputElement, e: Event) {
            self.orientation = this.value as OrientationOptions;
            self.eventHub.triggerEvent('orientationSettingChanged');
        }

        // update border
        this.eventHub.subscribe('sizeSettingChanged', refreshBorderValues);
        this.eventHub.subscribe('orientationSettingChanged', refreshBorderValues);
        function refreshBorderValues() {
            self.setInputConstraints();
            self.setSideBorderInput(self.sideBorder);
            self.setVerticalBorderInput(self.verticalBorder);
        }
    }

    setSideBorderInput(value: number) {
        value = value || 0;
        value = Math.round(value / 0.125) * 0.125;
        value = clamp(value, this.sideBorderInput.getMin(), this.sideBorderInput.getMax());

        this.sideBorder = value;
        this.sideBorderInput.set(value);
        this.sideBorderValueDisplay.innerText = `Side Border: ${value}"`;
    }

    setVerticalBorderInput(value: number) {
        value = value || 0;
        value = Math.round(value / 0.125) * 0.125;
        value = clamp(value, this.verticalBorderInput.getMin(), this.verticalBorderInput.getMax());

        this.verticalBorder = value;
        this.verticalBorderInput.set(value);
        this.verticalBorderValueDisplay.innerText = `Top/Bottom Border: ${value}"`;
    }

    setBorderColor(color: string) {
        this.borderColor = color;
        this.colorInput.value = color;
    }

    getVirtualDimensions(): VirtualDimensions {
        let canvasWidth = this.canvas.getWidth();
        let canvasHeight = this.canvas.getHeight();
        let canvasAspectRatio = canvasWidth / canvasHeight;
        let posterAspectRatio = this.getAspectRatio();

        let posterWidth;
        let posterHeight;

        const overlayMargin = 0.9;
        if (posterAspectRatio >= canvasAspectRatio) { // poster wider than canvas
            posterWidth = overlayMargin * canvasWidth;
            posterHeight = posterWidth / posterAspectRatio;
        }
        else { // poster taller than canvas
            posterHeight = overlayMargin * canvasHeight;
            posterWidth = posterAspectRatio * posterHeight;
        }

        let canvasHorizontalMargin = (canvasWidth - posterWidth) / 2;
        let canvasVerticalMargin = (canvasHeight - posterHeight) / 2;

        let posterLeft = canvasHorizontalMargin;
        let posterRight = canvasHorizontalMargin + posterWidth;
        let posterTop = canvasVerticalMargin;
        let posterBottom = canvasVerticalMargin + posterHeight;

        let realPosterDimensions = this.getRealPosterDimensions();
        let inchesPerPixel = realPosterDimensions.width / posterWidth;

        let borderWidth = this.sideBorder / inchesPerPixel;
        let borderHeight = this.verticalBorder / inchesPerPixel;
        let posterLeftBorder = posterLeft + borderWidth;
        let posterRightBorder = posterRight - borderWidth;
        let posterTopBorder = posterTop + borderHeight;
        let posterBottomBorder = posterBottom - borderHeight;
        let posterInnerBorderWidth = posterRightBorder - posterLeftBorder;
        let posterInnerBorderHeight = posterBottomBorder - posterTopBorder;
        let borderInnerAspectRatio = posterInnerBorderWidth / posterInnerBorderHeight;

        return {
            canvasWidth,
            canvasHeight,
            canvasAspectRatio,
            canvasHorizontalMargin,
            canvasVerticalMargin,
            inchesPerPixel,
            posterAspectRatio,
            posterWidth,
            posterHeight,
            posterLeft,
            posterRight,
            posterTop,
            posterBottom,
            borderWidth,
            borderHeight,
            posterLeftBorder,
            posterRightBorder,
            posterTopBorder,
            posterBottomBorder,
            posterInnerBorderWidth,
            posterInnerBorderHeight,
            borderInnerAspectRatio,
        };
    }

    populateSizeInputOptions() {
        const addSizeOption = (option: SizeOptions) => {
            let elem = document.createElement('option');
            elem.value = option;
            elem.text = sizeOptionsDisplayMap[option];
            this.sizeInput.appendChild(elem);
        }

        for (let key of Object.keys(sizeOptionsDisplayMap) as Array<keyof typeof sizeOptionsDisplayMap>) {
            addSizeOption(key);
        }
    }

    readSettingsFromUrl(urlStr: string) {
        let url = new URL(urlStr);

        // TODO - validate orientation and size are set, display warning if they are not
        // TODO: etsy - map from etsy variation id to option
        let orientation = url.searchParams.get('orientation');
        let size = url.searchParams.get('size');

        if (orientation) {
            this.orientation = orientationOptionsEtsyUrlMap[orientation];
            this.orientationInput.value = this.orientation;
        }
        if (size) {
            this.size = sizeOptionsEtsyUrlMap[size];
            this.sizeInput.value = this.size;
        }

        this.setInputConstraints();
    }

    getRealPosterDimensions(): RealPosterDimensions {
        let width = parseFloat(this.size.split('x')[0]);
        let height = parseFloat(this.size.split('x')[1]);

        if (this.orientation == 'portrait') {
            return {
                width,
                height,
            };
        }
        else {
            return {
                width: height,
                height: width,
            };
        }
    }

    getAspectRatio(): number {
        let width = parseFloat(this.size.split('x')[0]);
        let height = parseFloat(this.size.split('x')[1]);

        if (this.orientation == 'portrait') {
            return width / height;
        }
        else {
            return height / width;
        }
    }

    setImageScale(value: number) {
        value = value || 1;
        this.imageScaleValue = value;
        this.imageScaleInput.set(toSliderScaleValue(value));
    }
}

class NoUiSlider {
    constructor(targetId: string, min: number, max: number, start: number, step: number) {
        this.slider = noUiSlider.create(document.getElementById(targetId)!, {
            start: start,
            step: step,
            range: {
                'min': min,
                'max': max,
            },
            connect: 'lower',
            format: {
                to: function (value) {
                    return value.toFixed(3);
                },
                from: function (value) {
                    return parseFloat(value);
                }
            },
            animate: false,
        });
    }

    slider: NoUiAPI;

    get(): number {
        return this.slider.get() as number;
    }

    set(value: number) {
        this.slider.set(value);
    }

    getMax(): number {
        return this.slider.options.range.max.valueOf() as number;
    }

    getMin(): number {
        return this.slider.options.range.min.valueOf() as number;
    }

    setMax(value: number) {
        this.slider.updateOptions({
            range: {
                min: 0,
                max: value,
            },
        }, false);
    }

    setUiWidth(width: number) {
        this.slider.target.style.width = width + 'px';
    }
}

function fromSliderScaleValue(sliderValue: string): number {
    let value = parseFloat(sliderValue) || 1;
    value = Math.pow(2, value) - 1;
    return value;
}

function toSliderScaleValue(value: number): number {
    let sliderValue = value;
    return Math.log2(sliderValue + 1);
}

function clamp(value: number, min: number, max: number) {
    value = Math.max(min, value);
    value = Math.min(max, value);
    return value;
}

const SIZE_STEP = 0.05;

export type OrientationOptions = "landscape" | "portrait";
// TODO: etsy - replace keys with etsy variation id
const orientationOptionsEtsyUrlMap: Record<string, OrientationOptions> = {
    'landscape': 'landscape',
    'portrait': 'portrait',
}

export type SizeOptions = keyof typeof sizeOptionsDisplayMap;
const sizeOptionsDisplayMap = {
    '8.5x11': '8.5"x11"',
    '11x17': '11"x17"',
    // '8x24': '8"x24"',       // 1:3
    // '12x24': '12"x24"',     // 1:2
    // '16x24': '16"x24"',     // 2:3
    '18x24': '18"x24"',     // 3:4
    '24x36': '24"x36"',
};

// TODO: etsy - replace keys with etsy variation id
const sizeOptionsEtsyUrlMap: Record<string, SizeOptions> = {
    '8.5x11': '8.5x11',
    '11x17': '11x17',
    // '8x24': '8x24',
    // '12x24': '12x24',
    // '16x24': '16x24',
    '18x24': '18x24',
    '24x36': '24x36',
};

interface RealPosterDimensions {
    width: number,
    height: number,
}

// validation
(function validateSizeOptions() {
    if (Object.keys(sizeOptionsEtsyUrlMap).length !== Object.keys(sizeOptionsDisplayMap).length) {
        console.error('etsy size options mismatch');
    }
})();
