import { fabric } from "fabric";
import Overlay from './overlay';
import Settings from './settings';
import PosterImage from './image';
import Border from "./border";
import Render from './render';
import PosterEventHub from "./posterEventHub";
import SaveModal from "./saveModal";
import ClearPoster from "./clearPoster";
import UploadModal from "./uploadModal";

import '@themesberg/flowbite';

const canvas = new fabric.Canvas('fabric-canvas');

const eventHub = new PosterEventHub();
const settings = new Settings(canvas, eventHub);
// TODO: read settings from document.referrer
// readSettingsFromUrl(document.referrer);
settings.readSettingsFromUrl(window.location.toString());

const overlay = new Overlay(canvas, settings, eventHub);
const image = new PosterImage(canvas, settings, eventHub);
const border = new Border(canvas, settings, image, eventHub);
const render = new Render(image, canvas, settings);
const posterUploader = new SaveModal(image, canvas, settings, eventHub);
const clearPoster = new ClearPoster(settings, eventHub);
const uploadModal = new UploadModal(eventHub);

const canvasResizeObserver = new ResizeObserver((entries) => resizeCanvas(entries));
const canvasElem = document.getElementById('fabric-canvas-wrapper')!;
canvasResizeObserver.observe(canvasElem);
function resizeCanvas(entries: ResizeObserverEntry[]) {
    if (entries.length != 1) {
        console.error('invalid number of entries');
        return;
    }
    const canvasParent = entries[0].contentRect;

    const oldDims = settings.getVirtualDimensions();
    canvas.setWidth(canvasParent.width);
    canvas.setHeight(canvasParent.height);
    const newDims = settings.getVirtualDimensions();

    // scale image to fit new canvas size
    if (image.image) {
        let oldInchesFromLeft = (image.image.left! - oldDims.posterLeft) * oldDims.inchesPerPixel;
        let oldInchesFromTop = (image.image.top! - oldDims.posterTop) * oldDims.inchesPerPixel;

        eventHub.triggerEvent('imageScaled'); // scale image to canvas

        let newLeft = (oldInchesFromLeft / newDims.inchesPerPixel) + newDims.posterLeft;
        let newTop = (oldInchesFromTop / newDims.inchesPerPixel) + newDims.posterTop;
        image.moveImageTo({
            left: newLeft,
            top: newTop,
        });
    }

    overlay.drawOverlay();
    border.drawBorder();
    canvas.renderAll();
}

// TODO: remove
(window as any).canvas = canvas; // TODO: remove this
(window as any).mySettings = settings; // TODO: remove this
(window as any).myImage = image; // TODO: remove this
(window as any).render = render; // TODO: remove this