import { isMobile } from "react-device-detect";
import { fabric } from "fabric";
import PosterImage from "./image";
import Overlay from "./overlay";
import PosterSettings, { OrientationOptions, SizeOptions, sizes } from "./settings";
import Border from "./border";
import axios from "axios";
import { makeAutoObservable, autorun } from "mobx";
import PreviewCanvas from "./previewCanvas";
import { SaveData } from "./PosterExporter";

// // configure axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://dev-api.visualinkworks.com';

export default class Poster {
    constructor() {
        const megapixel = 1048576;
        if (isMobile) {
            (fabric as any).perfLimitSizeTotal = 4 * megapixel;
        }
        else {
            (fabric as any).perfLimitSizeTotal = 16 * megapixel;
        }
        makeAutoObservable(this);

        const canvas = new fabric.Canvas(document.createElement('canvas'));
        this.previewCanvas = new PreviewCanvas(this, new fabric.Canvas(document.createElement('canvas')));
        this.settings = new PosterSettings(canvas);
        this.posterLoadStatus = 'none';
        this.posterId = null;

        this.overlay = new Overlay(canvas, this.settings);
        this.image = new PosterImage(this, canvas, this.settings);
        this.border = new Border(this, canvas, this.settings, this.image);

        this.defaultSize = sizes[0];
        this.designMode = 'design';
        this.shopify = false;
        this.autorunPreview();
    }

    canvas?: fabric.Canvas;
    previewCanvas: PreviewCanvas;
    settings: PosterSettings;
    overlay: Overlay;
    image: PosterImage;
    border: Border;
    defaultSize: SizeOptions;
    designMode: 'design' | 'preview';
    shopify: boolean;
    posterLoadStatus: 'none' | 'loading' | 'loaded';
    posterId: string|null;

    get hasImage() {
        return this.image.uploadStatus !== 'none' || this.image.renderStatus !== 'none';
    }

    updatePreview() {
        if (this.designMode === 'preview') { // only update in preview mode
            this.previewCanvas.needsUpdate = true;
        }
    }

    private autorunPreview() {
        setInterval(() => {
            const previewer = this.previewCanvas;
            // ensure only one instance of updatePoster is running at a time, 
            // otherwise issues occur such as duplicate posters in the preview 
            if (!previewer.updating && previewer.needsUpdate) {
                previewer.needsUpdate = false;
                previewer.updating = true;
                previewer.updatePoster();
            }
        }, 50);

        autorun(() => {
            // access observables to force this effect to run
            let forceObservation: any = this.image.dpi;
            forceObservation = this.settings.borderColor;
            forceObservation = this.settings.getVirtualDimensions();
            forceObservation = this.settings.realPosterDimensions;

            // eslint-disable-next-line
            forceObservation = true;

            if (this.designMode === 'preview') { // only update in preview mode
                this.previewCanvas.needsUpdate = true;
            }
        }, {
            // delay: 100,
            scheduler: (run) => {setTimeout(run, 50);}
        });
    }

    readSettingsFromUrl() {
        const url = new URL(document.URL);
        if (url.hash) {
            const hash = url.hash.replace('#', '');
            const params = new URLSearchParams(hash);
            this.settings.configureFromSearchParams(params);
            this.shopify = params.get('shopify') === '1';

            const posterId = params.get('posterId');
            if (posterId) {
                this.loadPoster(posterId);
            }
        }
    }

    async loadPoster(posterId: string) {
        // TODO - while loading display unescapable loading modal, potentially with progress bar for image download
        this.posterLoadStatus = 'loading';
        this.posterId = posterId;

        const response = await axios.get<LoadPosterResponse>("load-poster", {
            params: {
                'posterId': posterId,
            }
        });

        const poster = response.data;
        const saveData = poster.saveData;
        
        // TODO:check if image in local cache/storage and load from there
        const imgResponse = await axios.get(poster.originalImageUrl, { responseType: 'blob' });
        const reader = new window.FileReader();
        reader.readAsDataURL(imgResponse.data);
        reader.onload = () => {
            this.image.uploadStatus = 'uploaded';
            this.image.renderStatus = 'rendering';
            this.image.uploadProgress = 100;

            const imageDataUrl = reader.result as string;
            this.image.isSvg = /image\/svg/.test(imageDataUrl);
            this.image.imgElem!.setAttribute('src', imageDataUrl);
            this.image.imgElem!.onload = () => {
                // settings
                this.settings.size = saveData.size as SizeOptions;
                this.settings.orientation = saveData.orientation as OrientationOptions;
                this.settings.originalImageKey = saveData.imageKey;

                // image
                const image = new fabric.Image(this.image.imgElem!);
                this.image.setNewImage(image);

                // scale
                const targetDims = saveData.virtualDimensions;
                const targetRatioX = saveData.canvasImage.width * saveData.canvasImage.scaleX / targetDims.posterWidth;

                const dims = this.settings.getVirtualDimensions();
                image.scaleToWidth(dims.posterWidth * targetRatioX);
                this.image.updateScaleSlider();

                // position
                const leftOffset = (saveData.canvasImage.left - targetDims.posterLeft ) / targetDims.posterWidth;
                const topOffset = (saveData.canvasImage.top - targetDims.posterTop) / targetDims.posterHeight;
                image.set({
                    left: leftOffset * dims.posterWidth + dims.posterLeft,
                    top: topOffset * dims.posterHeight + dims.posterTop,
                });

                // borders
                this.settings.setBorderColor(saveData.borders.color);
                this.border.updateBorder(saveData.borders.left);

                this.posterLoadStatus = 'loaded';
            };
        };
    }

    setCanvas(canvas: fabric.Canvas) {
        this.canvas = canvas;
        this.settings.canvas = canvas;
        canvas.setBackgroundColor(this.settings.borderColor, () => undefined);
        this.overlay.canvas = canvas;
        this.image.canvas = canvas;
        this.border.canvas = canvas;

        this.overlay.drawOverlay();
        this.border.drawBorder();
        this.canvas?.renderAll();
    }

    setPreviewCanvas(canvas: fabric.Canvas) {
        this.previewCanvas.canvas = canvas;
    }
}

interface LoadPosterResponse {
    saveData: SaveData;
    originalImageUrl: string;
}