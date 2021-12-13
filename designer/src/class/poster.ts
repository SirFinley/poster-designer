import { fabric } from "fabric";
import PosterImage from "./image";
import Overlay from "./overlay";
import PosterSettings, { SizeOptions } from "./settings";
// import Overlay from './overlay';
// import Settings from './settings';
// import PosterImage from './image';
// import Border from "./border";
// import Render from './render';
// import PosterEventHub from "./posterEventHub";
// import SaveModal from "./saveModal";
// import ClearPoster from "./clearPoster";
// import UploadModal from "./uploadModal";

// TODO: this
// import '@themesberg/flowbite';
// import axios from "axios";

// // configure axios
// axios.defaults.baseURL = process.env.APP_API_URL || 'https://api.visualinkworks.com';

class Poster {
    constructor() {
        const canvas = new fabric.Canvas(document.createElement('canvas'));
        this.settings = new PosterSettings(canvas);
        // TODO: read settings from document.referrer
        // readSettingsFromUrl(document.referrer);
        // settings.readSettingsFromUrl(window.location.toString());

        this.overlay = new Overlay(canvas, this.settings);
        this.image = new PosterImage(canvas, this.settings);
        // const border = new Border(canvas, settings, image, eventHub);
        // const render = new Render(image, canvas, settings);
        // const posterUploader = new SaveModal(image, canvas, settings, eventHub);
        // const clearPoster = new ClearPoster(settings, eventHub);
        // const uploadModal = new UploadModal(eventHub);

        this.defaultSize = '8.5x11';
        this.readSettingsFromUrl();
    }

    readSettingsFromUrl() {
    }

    canvas?: fabric.Canvas;
    settings: PosterSettings;
    overlay: Overlay;
    image: PosterImage;
    defaultSize: SizeOptions;

    setCanvas(canvas: fabric.Canvas) {
        this.canvas = canvas;
        this.settings.canvas = canvas;
        this.overlay.canvas = canvas;
        this.image.canvas = canvas;

        this.overlay.drawOverlay();
        // this.border.drawBorder();
        this.canvas?.renderAll();
    }
}

const poster = new Poster();
export default poster;