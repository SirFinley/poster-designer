import { fabric } from "fabric";
import PosterImage from "./image";
import Overlay from "./overlay";
import PosterSettings, { SizeOptions } from "./settings";
import Border from "./border";
import axios from "axios";

// // configure axios
axios.defaults.baseURL = process.env.APP_API_URL || 'https://api.visualinkworks.com';

class Poster {
    constructor() {
        const canvas = new fabric.Canvas(document.createElement('canvas'));
        this.settings = new PosterSettings(canvas);
        // TODO: read settings from document.referrer
        // readSettingsFromUrl(document.referrer);
        // settings.readSettingsFromUrl(window.location.toString());

        this.overlay = new Overlay(canvas, this.settings);
        this.image = new PosterImage(canvas, this.settings);
        this.border = new Border(canvas, this.settings, this.image);
        // const render = new Render(image, canvas, settings);

        this.defaultSize = '8.5x11';
        this.readSettingsFromUrl();
    }

    readSettingsFromUrl() {
    }

    canvas?: fabric.Canvas;
    settings: PosterSettings;
    overlay: Overlay;
    image: PosterImage;
    border: Border;
    defaultSize: SizeOptions;

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
}

const poster = new Poster();
export default poster;