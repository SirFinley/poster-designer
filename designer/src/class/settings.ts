import { makeAutoObservable } from "mobx";
import VirtualDimensions from "./virtualDimensions";

const defaultSize = '18x24';
const defaultOrientation = 'portrait';
const defaultPaper = 'glossy';

export default class PosterSettings {
    canvas: fabric.Canvas;

    orientation: OrientationOptions;
    size: SizeOptions;
    paper: PaperOptions;

    border: number;

    borderColor: string;

    originalImageKey: string | null;

    constructor(canvas: fabric.Canvas) {
        makeAutoObservable(this);

        this.canvas = canvas;

        this.orientation = defaultOrientation;
        this.size = defaultSize;
        this.paper = defaultPaper;
        this.border = 0;
        this.borderColor = '#ffffff';
        this.originalImageKey = null;
    }

    setBorderColor(color: string) {
        this.borderColor = color;
        this.canvas?.setBackgroundColor(color, () => undefined);
        this.canvas?.renderAll();
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

    isOutOfStock(paper: PaperOptions): boolean {
        const url = new URL(document.URL);
        if (url.hash) {
            const hash = url.hash.replace('#', '');
            const params = new URLSearchParams(hash);
            const outOfStockParam  = params.get('outOfStock') ?? '';
            const outOfStockPaper = outOfStockParam.split(',').map(validatePaper) as PaperOptions[];
            return outOfStockPaper.includes(paper);
        }

        return false;
    }

    configureFromSearchParams(params: URLSearchParams) {
        const size = validateSize(params.get('size')?.replaceAll('"', ''));
        if (size) {
            this.size = size;
        }

        const orientation = validateOrientation(params.get('orientation')?.toLowerCase());
        if (orientation) {
            this.orientation = orientation;
        }

        const paper = validatePaper(params.get('paper'));
        if (paper) {
            this.paper = paper;
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

    getEtsyUrl(): string {
        const etsyUrl = new URL('https://www.etsy.com/listing/1142787916/custom-poster-prints-glossy-paper-high');
        etsyUrl.searchParams.set('variation0', getEtsySizeId(this.paper, this.size));
        etsyUrl.searchParams.set('variation1', getEtsyOrientationId(this.paper, this.orientation));
        return etsyUrl.toString();
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

function validatePaper(value: string|null|undefined): PaperOptions|null {
    value = paperShopifyToSetting.get(value ?? '');
    if (papers.includes(value as PaperOptions)) {
        return value as PaperOptions;
    }
    return null;
}

function getEtsySizeId(paper: PaperOptions, size: SizeOptions): string {
    return sizeOptionToEtsyId.get(size) || '';
}

function getEtsyOrientationId(paper: PaperOptions, orientation: OrientationOptions): string {
    return orientationOptionToEtsyId.get(orientation) || '';
}

export const orientations = ['landscape', 'portrait'] as const;
export type OrientationOptions = typeof orientations[number];

export const sizes = ['18x24', '24x30', '24x36'] as const;
export type SizeOptions = typeof sizes[number];
export const sizeOptionsDisplayMap = new Map<SizeOptions, string>([
    ['18x24', '18"x24"'],
    ['24x30', '24"x30"'],
    ['24x36', '24"x36"'],
]);

export const sizeOptionToEtsyId = new Map<SizeOptions, string>([
    ["18x24", "2403501782"],
    ["24x30", "2428358951"],
    ["24x36", "2403501790"],
]);

export const orientationOptionToEtsyId = new Map<OrientationOptions, string>([
    ["portrait", "2403501776"],
    ["landscape", "2403501780"],
]);
export const papers = ['glossy', 'matte', 'metallic'] as const;
export type PaperOptions = typeof papers[number];
export const paperOptionsDisplayMap = new Map<PaperOptions, string>([
    ['glossy', 'Glossy'],
    ['matte', 'Matte'],
    ['metallic', 'Metallic Gloss'],
]);
export const paperSettingToShopify = new Map<PaperOptions, string>([
    ['glossy', 'Glossy'],
    ['matte', 'Matte'],
    ['metallic', 'Metallic Gloss'],
]);
export const paperShopifyToSetting = new Map<string, PaperOptions>([
    ['Glossy', 'glossy'],
    ['Matte', 'matte'],
    ['Metallic Gloss', 'metallic'],
]);

interface RealPosterDimensions {
    width: number,
    height: number,
}
