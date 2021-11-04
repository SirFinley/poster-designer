import { fabric } from "fabric";
import Overlay from './overlay';
import Settings from './settings';
import PosterImage from './image';
import Border from "./border";
import PosterEventHub from "./posterEventHub";

const canvas = new fabric.Canvas('fabric-canvas');

const eventHub = new PosterEventHub();
const settings = new Settings(eventHub);
// TODO: read settings from document.referrer
// readSettingsFromUrl(document.referrer);
settings.readSettingsFromUrl(window.location.toString());

const overlay = new Overlay(canvas, settings, eventHub);
const image = new PosterImage(canvas, settings, eventHub);
const border = new Border(canvas, settings, image, eventHub);

docReady(() => {
    resizeCanvas();
    image.fitImageToBorders();
});

window.onresize = resizeCanvas;
function resizeCanvas() {
    let canvasParent = document.getElementById('fabric-canvas-wrapper');
    let floatingCanvasParent = document.getElementById('floating-canvas-container');
    floatingCanvasParent.style.position = 'absolute';
    floatingCanvasParent.style.left = canvasParent.offsetLeft + 'px';
    floatingCanvasParent.style.top = canvasParent.offsetTop + 'px';
    floatingCanvasParent.style.zIndex = '99999';

    canvas.setWidth(canvasParent.offsetWidth);
    canvas.setHeight(canvasParent.offsetHeight);

    overlay.drawOverlay();
    border.setBorder();
    canvas.renderAll();
}

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

// TODO: remove
(window as any).canvas = canvas; // TODO: remove this
(window as any).mySettings = settings; // TODO: remove this
(window as any).myImage = image; // TODO: remove this