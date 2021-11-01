import VirtualDimensions from "./virtualDimensions";

export default class Settings {
    orientation: OrientationOptions;
    size: SizeOptions;

    leftMargin: number;
    rightMargin: number;
    topMargin: number;
    bottomMargin: number;

    orientationInput: HTMLInputElement;
    sizeInput: HTMLInputElement;
    leftMarginInput: HTMLInputElement;
    rightMarginInput: HTMLInputElement;
    topMarginInput: HTMLInputElement;
    bottomMarginInput: HTMLInputElement;

    onOverlayChanged: () => void;

    constructor() {
        (window as any).mySettings = this; // TODO: remove this
        this.orientation = 'landscape';
        this.size = '24x36';
        this.leftMargin = 0;
        this.rightMargin = 0;
        this.topMargin = 0;
        this.bottomMargin = 0;
        this.onOverlayChanged = () => { };

        this.orientationInput = document.getElementById("orientation-input") as HTMLInputElement;
        this.sizeInput = document.getElementById("size-input") as HTMLInputElement;
        this.leftMarginInput = document.getElementById("left-margin") as HTMLInputElement;
        this.rightMarginInput = document.getElementById("right-margin") as HTMLInputElement;
        this.topMarginInput = document.getElementById("top-margin") as HTMLInputElement;
        this.bottomMarginInput = document.getElementById("bottom-margin") as HTMLInputElement;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        let self = this;

        this.leftMarginInput.addEventListener('input', onMarginInput);
        this.rightMarginInput.addEventListener('input', onMarginInput);
        function onMarginInput(this: HTMLInputElement, e: Event) {
            console.log(this.id);

            let value = parseInt(this.value);
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

        this.sizeInput.addEventListener('change', onSizeInput);
        function onSizeInput(this: HTMLInputElement, e: Event) {
            self.size = this.value as SizeOptions;
            self.onOverlayChanged();
        }

        this.orientationInput.addEventListener('change', onOrientationInput);
        function onOrientationInput(this: HTMLInputElement, e: Event) {
            self.orientation = this.value as OrientationOptions;
            self.onOverlayChanged();
        }
    }

    getVirtualDimensions(canvas: fabric.Canvas): VirtualDimensions {
        let canvasWidth = canvas.width!;
        let canvasHeight = canvas.height!;
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
            posterLeftMargin,
            posterRightMargin,
            posterTopMargin,
            posterBottomMargin,
        };
    }

    populateInputOptions() {
        // fill dropdown options
    }

    readSettingsFromUrl(urlStr: string) {
        let url = new URL(urlStr);

        // TODO - validate orientation and size are set, display warning if they are not
        // TODO - map from etsy variation id to option
        const sizeMap: Record<string, SizeOptions> = {
            "18x24": "18x24",
            "24x36": "24x36",
        }

        const orientationMap: Record<string, OrientationOptions> = {
            "landscape": "landscape",
            "portrait": "portrait",
        }
        let orientation = url.searchParams.get('orientation');
        let size = url.searchParams.get('size');

        if (orientation) {
            this.orientation = orientationMap[orientation];
            this.orientationInput.value = this.orientation;
        }
        if (size) {
            this.size = sizeMap[size];
            this.sizeInput.value = this.size;
        }
    }

    getRealPosterDimensions(): RealPosterDimensions {
        let width = parseFloat(this.size.split('x')[0]);
        let height = parseFloat(this.size.split('x')[1]);

        return {
            width,
            height
        };
    }

    getAspectRatio(): number {
        let width = parseFloat(this.size.split('x')[0]);
        let height = parseFloat(this.size.split('x')[1]);

        if (this.orientation == 'landscape') {
            return height / width;
        }
        else {
            return width / height;
        }
    }
}

export type OrientationOptions = "landscape" | "portrait";
export type SizeOptions = "8.5x11" | "11x17" | "18x24" | "24x36";
interface RealPosterDimensions {
    width: number,
    height: number,
}