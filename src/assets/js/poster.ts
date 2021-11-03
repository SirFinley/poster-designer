import { fabric } from "fabric";
import Overlay from './overlay';
import Settings from './settings';
import PosterImage from './image';

const canvas = new fabric.Canvas('fabric-canvas');

let settings = new Settings();
// TODO: read settings from document.referrer
// readSettingsFromUrl(document.referrer);
settings.readSettingsFromUrl(window.location.toString());

let overlay = new Overlay(canvas, settings);
let image = new PosterImage(canvas, settings);

docReady(() => {
    resizeCanvas();
    image.fitImageToBorders();
});

window.onresize = resizeCanvas;
function resizeCanvas() {
    console.log('resized!');

    let canvasParent = document.getElementById('fabric-canvas-wrapper');
    let floatingCanvasParent = document.getElementById('floating-canvas-container');
    floatingCanvasParent.style.position = 'absolute';
    floatingCanvasParent.style.left = canvasParent.offsetLeft + 'px';
    floatingCanvasParent.style.top = canvasParent.offsetTop + 'px';
    floatingCanvasParent.style.zIndex = '99999';

    canvas.setWidth(canvasParent.offsetWidth);
    canvas.setHeight(canvasParent.offsetHeight);

    overlay.drawOverlay();
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