import { makeAutoObservable } from "mobx";
import VirtualDimensions from "./virtualDimensions";

const defaultSize = '18x24';
const defaultOrientation = 'portrait';

export default class PosterSettings {
    canvas: fabric.Canvas;

    orientation: OrientationOptions;
    size: SizeOptions;

    border: number;

    borderColor: string;

    originalImageKey: string | null;

    constructor(canvas: fabric.Canvas) {
        makeAutoObservable(this);

        this.canvas = canvas;

        this.orientation = defaultOrientation;
        this.size = defaultSize;
        this.border = 0;
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

        const borderWidth = this.border / inchesPerPixel;
        const borderHeight = this.border / inchesPerPixel;
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
            this.orientation = orientationOptionsEtsyUrlMap[orientation] || defaultOrientation;
        }
        if (size) {
            this.size = sizeOptionsEtsyUrlMap[size] || defaultSize;
        }
    }

    configureFromSearchParams(params: URLSearchParams) {
        const size = validateSize(params.get('size')?.replaceAll('"', ''));
        if (size) {
            this.size = size;
        }
        const orientation = validateOrientation(params.get('orientation'));
        if (orientation) {
            this.orientation = orientation;
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

function validateSize(value: string|null|undefined): SizeOptions|null {
    if (sizes.includes(value as SizeOptions)) {
        return value as SizeOptions;
    }
    return null;
}

function validateOrientation(value: string|null|undefined): OrientationOptions|null {
    if (orientations.includes(value as OrientationOptions)) {
        return value as OrientationOptions;
    }
    return null;
}

export const orientations = ['landscape', 'portrait'] as const;
export type OrientationOptions = typeof orientations[number];
// TODO: etsy - replace keys with etsy variation id
const orientationOptionsEtsyUrlMap: Record<string, OrientationOptions> = {
    'landscape': 'landscape',
    'portrait': 'portrait',
}

export const sizes = ['18x24', '24x30', '24x36'] as const;
export type SizeOptions = typeof sizes[number];
export const sizeOptionsDisplayMap = new Map<SizeOptions, string>([
    ['18x24', '18"x24"'],
    ['24x30', '24"x30"'],
    ['24x36', '24"x36"'],
]);

// TODO: etsy - replace keys with etsy variation id
const sizeOptionsEtsyUrlMap: Record<string, SizeOptions> = {
    '18x24': '18x24',
    '24x30': '24x30',
    '24x36': '24x36',
};

interface RealPosterDimensions {
    width: number,
    height: number,
}

// validation
(function validateSizeOptions() {
    if (Object.keys(sizeOptionsEtsyUrlMap).length !== sizeOptionsDisplayMap.size) {
        console.error('etsy size options mismatch');
    }
})();
