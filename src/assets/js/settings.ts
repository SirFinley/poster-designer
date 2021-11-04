import PosterEventHub from "./posterEventHub";
import VirtualDimensions from "./virtualDimensions";

export default class Settings {
    eventHub: PosterEventHub;

    orientation: OrientationOptions;
    size: SizeOptions;

    sideBorder: number;
    verticalBorder: number;

    leftMargin: number;
    rightMargin: number;
    topMargin: number;
    bottomMargin: number;

    orientationInput: HTMLInputElement;
    sizeInput: HTMLInputElement;

    sideBorderInput: HTMLInputElement;
    sideBorderValueDisplay: HTMLElement;
    verticalBorderInput: HTMLInputElement;
    verticalBorderValueDisplay: HTMLElement;

    leftMarginInput: HTMLInputElement;
    rightMarginInput: HTMLInputElement;
    topMarginInput: HTMLInputElement;
    bottomMarginInput: HTMLInputElement;

    constructor(eventHub: PosterEventHub) {
        this.eventHub = eventHub;

        this.orientation = 'landscape';
        this.size = '24x36';
        this.sideBorder = 0;
        this.verticalBorder = 0;
        this.leftMargin = 0;
        this.rightMargin = 0;
        this.topMargin = 0;
        this.bottomMargin = 0;

        this.orientationInput = document.getElementById("orientation-input") as HTMLInputElement;
        this.sizeInput = document.getElementById("size-input") as HTMLInputElement;

        this.sideBorderInput = document.getElementById("side-border") as HTMLInputElement;
        this.sideBorderValueDisplay = document.getElementById("side-border-value") as HTMLElement;
        this.verticalBorderInput = document.getElementById("vertical-border") as HTMLInputElement;
        this.verticalBorderValueDisplay = document.getElementById("vertical-border-value") as HTMLElement;

        this.leftMarginInput = document.getElementById("left-margin") as HTMLInputElement;
        this.rightMarginInput = document.getElementById("right-margin") as HTMLInputElement;
        this.topMarginInput = document.getElementById("top-margin") as HTMLInputElement;
        this.bottomMarginInput = document.getElementById("bottom-margin") as HTMLInputElement;

        this.initializeEventListeners();
        this.populateSizeInputOptions();
        this.setInputConstraints();
    }

    setInputConstraints() {
        let size = this.getRealPosterDimensions();
        this.sideBorderInput.max = (size.width / 2 - 0.125).toFixed(2);
        this.verticalBorderInput.max = (size.height / 2 - 0.125).toFixed(2);
    }

    initializeEventListeners() {
        let self = this;

        // borders
        this.sideBorderInput.addEventListener('input', onBorderInput);
        this.verticalBorderInput.addEventListener('input', onBorderInput);

        function onBorderInput(this: HTMLInputElement, e: Event) {
            let value = parseFloat(this.value) || 0;
            if (this.id === 'side-border') {
                self.sideBorder = value;
                self.sideBorderValueDisplay.innerText = `Side Border: ${value}"`;
            }
            else if (this.id === 'vertical-border') {
                self.verticalBorder = value;
                self.verticalBorderValueDisplay.innerText = `Top/Bottom Border: ${value}"`;
            }

            self.eventHub.triggerEvent('borderSettingChanged');
        }

        // margins
        this.leftMarginInput.addEventListener('input', onMarginInput);
        this.rightMarginInput.addEventListener('input', onMarginInput);
        this.topMarginInput.addEventListener('input', onMarginInput);
        this.bottomMarginInput.addEventListener('input', onMarginInput);

        function onMarginInput(this: HTMLInputElement, e: Event) {
            let value = parseFloat(this.value) || 0;
            if (this.id === 'left-margin') {
                self.leftMargin = value;
            }
            else if (this.id === 'right-margin') {
                self.rightMargin = value;
            }
            else if (this.id === 'top-margin') {
                self.topMargin = value;
            }
            else if (this.id === 'bottom-margin') {
                self.bottomMargin = value;
            }
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
        this.eventHub.addEventListener('sizeSettingChanged', refreshBorderValues);
        this.eventHub.addEventListener('orientationSettingChanged', refreshBorderValues);
        function refreshBorderValues() {
            self.setInputConstraints();
            self.setSideBorderInput(self.sideBorder);
            self.setVerticalBorderInput(self.verticalBorder);
        }
    }

    setSideBorderInput(value: number) {
        value = value || 0;
        value = clamp(value, parseFloat(this.sideBorderInput.min), parseFloat(this.sideBorderInput.max));

        this.sideBorder = value;
        this.sideBorderInput.value = value.toString();
        this.sideBorderValueDisplay.innerText = `Side Border: ${value}"`;
    }

    setVerticalBorderInput(value: number) {
        value = value || 0;
        value = clamp(value, parseFloat(this.verticalBorderInput.min), parseFloat(this.verticalBorderInput.max));

        this.verticalBorder = value;
        this.verticalBorderInput.value = value.toString();
        this.verticalBorderValueDisplay.innerText = `Top/Bottom Border: ${value}"`;
    }

    getVirtualDimensions(canvas: fabric.Canvas): VirtualDimensions {
        let canvasWidth = canvas.getWidth();
        let canvasHeight = canvas.getHeight();
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

        let posterLeftMargin = this.leftMargin / inchesPerPixel;
        let posterRightMargin = this.rightMargin / inchesPerPixel;
        let posterTopMargin = this.topMargin / inchesPerPixel;
        let posterBottomMargin = this.bottomMargin / inchesPerPixel;

        return {
            canvasWidth,
            canvasHeight,
            canvasAspectRatio,
            canvasHorizontalMargin,
            canvasVerticalMargin,
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
            posterLeftMargin,
            posterRightMargin,
            posterTopMargin,
            posterBottomMargin,
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

    setMargins(left: number, right: number, top: number, bottom: number) {
        function round(x: number, multiple: number) {
            return Math.round(x / multiple) * multiple;
        }

        left = round(left, SIZE_STEP);
        right = round(right, SIZE_STEP);
        top = round(top, SIZE_STEP);
        bottom = round(bottom, SIZE_STEP);

        this.leftMargin = left;
        this.leftMarginInput.value = left.toFixed(2);
        this.leftMarginInput.step = SIZE_STEP.toString();

        this.rightMargin = right;
        this.rightMarginInput.value = right.toFixed(2);
        this.rightMarginInput.step = SIZE_STEP.toString();

        this.topMargin = top;
        this.topMarginInput.value = top.toFixed(2);
        this.topMarginInput.step = SIZE_STEP.toString();

        this.bottomMargin = bottom;
        this.bottomMarginInput.value = bottom.toFixed(2);
        this.bottomMarginInput.step = SIZE_STEP.toString();

    }
}

function clamp(value: number, min: number, max: number){
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