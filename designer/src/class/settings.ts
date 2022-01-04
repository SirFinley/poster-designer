import { makeAutoObservable } from "mobx";
import VirtualDimensions from "./virtualDimensions";

export default class PosterSettings {
    canvas: fabric.Canvas;

    orientation: OrientationOptions;
    size: SizeOptions;

    sideBorder: number;
    verticalBorder: number;

    borderColor: string;

    originalImageKey: string | null;

    constructor(canvas: fabric.Canvas) {
        makeAutoObservable(this);

        this.canvas = canvas;

        this.orientation = 'portrait';
        this.size = '8.5x11';
        this.sideBorder = 0;
        this.verticalBorder = 0;
        this.borderColor = '#ffffff';
        this.originalImageKey = null;
    }

    setBorderColor(color: string) {
        this.borderColor = color;
    }

    getVirtualDimensions(): VirtualDimensions {
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        const canvasAspectRatio = canvasWidth / canvasHeight;
        const posterAspectRatio = this.getAspectRatio();

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

        const canvasHorizontalMargin = (canvasWidth - posterWidth) / 2;
        const canvasVerticalMargin = (canvasHeight - posterHeight) / 2;

        const posterLeft = canvasHorizontalMargin;
        const posterRight = canvasHorizontalMargin + posterWidth;
        const posterTop = canvasVerticalMargin;
        const posterBottom = canvasVerticalMargin + posterHeight;

        const realPosterDimensions = this.realPosterDimensions;
        const inchesPerPixel = realPosterDimensions.width / posterWidth;

        const borderWidth = this.sideBorder / inchesPerPixel;
        const borderHeight = this.verticalBorder / inchesPerPixel;
        const posterLeftBorder = posterLeft + borderWidth;
        const posterRightBorder = posterRight - borderWidth;
        const posterTopBorder = posterTop + borderHeight;
        const posterBottomBorder = posterBottom - borderHeight;
        const posterInnerBorderWidth = posterRightBorder - posterLeftBorder;
        const posterInnerBorderHeight = posterBottomBorder - posterTopBorder;
        const borderInnerAspectRatio = posterInnerBorderWidth / posterInnerBorderHeight;

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
        const url = new URL(urlStr);

        // TODO - validate orientation and size are set, display warning if they are not
        // TODO: etsy - map from etsy variation id to option
        const orientation = url.searchParams.get('orientation');
        const size = url.searchParams.get('size');

        if (orientation) {
            this.orientation = orientationOptionsEtsyUrlMap[orientation];
        }
        if (size) {
            this.size = sizeOptionsEtsyUrlMap[size];
        }
    }

    get realPosterDimensions(): RealPosterDimensions {
        const width = parseFloat(this.size.split('x')[0]);
        const height = parseFloat(this.size.split('x')[1]);

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
        const width = parseFloat(this.size.split('x')[0]);
        const height = parseFloat(this.size.split('x')[1]);

        if (this.orientation === 'portrait') {
            return width / height;
        }
        else {
            return height / width;
        }
    }
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
