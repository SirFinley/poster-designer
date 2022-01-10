import { fabric } from "fabric";
import PosterImage from "./image";
import Overlay from "./overlay";
import PosterSettings, { SizeOptions } from "./settings";
import Border from "./border";
import axios from "axios";
import { makeAutoObservable, autorun } from "mobx";
import PreviewCanvas from "./previewCanvas";

// // configure axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://dev-api.visualinkworks.com';

export default class Poster {
    constructor() {
        makeAutoObservable(this);

        const canvas = new fabric.Canvas(document.createElement('canvas'));
        this.previewCanvas = new PreviewCanvas(this, new fabric.Canvas(document.createElement('canvas')));
        this.settings = new PosterSettings(canvas);
        // TODO: read settings from document.referrer
        // readSettingsFromUrl(document.referrer);
        // settings.readSettingsFromUrl(window.location.toString());

        this.overlay = new Overlay(canvas, this.settings);
        this.image = new PosterImage(canvas, this.settings);
        this.border = new Border(canvas, this.settings, this.image);
        // const render = new Render(image, canvas, settings);

        this.defaultSize = '8.5x11';
        this.designMode = 'design';
        this.readSettingsFromUrl();
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

            if (this.designMode === 'preview') { // only update in preview mode
                this.previewCanvas.needsUpdate = true;
            }
        }, {
            // delay: 100,
            scheduler: (run) => {setTimeout(run, 50);}
        });
    }

    readSettingsFromUrl() {
    }

    setCanvas(canvas: fabric.Canvas) {
        this.canvas = canvas;
        this.settings.canvas = canvas;
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