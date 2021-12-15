import NoUiSliderClass from "./noUiSlider";
import eventHub, { PosterEventHub } from "./posterEventHub";
import VirtualDimensions from "./virtualDimensions";

export default class PosterSettings {
    canvas: fabric.Canvas;
    eventHub: PosterEventHub;

    orientation: OrientationOptions;
    size: SizeOptions;

    sideBorder: number;
    verticalBorder: number;

    orientationInput: HTMLInputElement;

    borderColor: string;

    imageScaleInput?: NoUiSliderClass;
    imageScaleValueDisplay: HTMLElement;
    imageScaleValue: number;
    originalImageKey: string | null;

    constructor(canvas: fabric.Canvas) {
        this.canvas = canvas;
        this.eventHub = eventHub;

        this.orientation = 'portrait';
        this.size = '8.5x11';
        this.sideBorder = 0;
        this.verticalBorder = 0;
        this.borderColor = '#ffffff';
        this.imageScaleValue = 1;
        this.originalImageKey = null;

        this.orientationInput = document.getElementById("orientation-input") as HTMLInputElement;

        this.imageScaleValueDisplay = document.getElementById("image-scale-value") as HTMLInputElement;
    }

    setBorderColor(color: string) {
        this.borderColor = color;
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
            // TODO: set size input
            // this.sizeInput.value = this.size;
        }

        this.eventHub.triggerEvent('sizeSettingChanged');
        this.eventHub.triggerEvent('orientationSettingChanged');
    }

    getRealPosterDimensions(): RealPosterDimensions {
        let width = parseFloat(this.size.split('x')[0]);
        let height = parseFloat(this.size.split('x')[1]);

        if (this.orientation === 'portrait') {
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

        if (this.orientation === 'portrait') {
            return width / height;
        }
        else {
            return height / width;
        }
    }

    setImageScale(value: number) {
        value = value || 1;
        this.imageScaleValue = value;
        this.imageScaleInput?.set(toSliderScaleValue(value));
    }
}

function toSliderScaleValue(value: number): number {
    let sliderValue = value;
    return Math.log2(sliderValue + 1);
}

export type OrientationOptions = "landscape" | "portrait";
// TODO: etsy - replace keys with etsy variation id
const orientationOptionsEtsyUrlMap: Record<string, OrientationOptions> = {
    'landscape': 'landscape',
    'portrait': 'portrait',
}

export type SizeOptions = keyof typeof sizeOptionsDisplayMap;
export const sizeOptionsDisplayMap: Record<string, string> = {
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
