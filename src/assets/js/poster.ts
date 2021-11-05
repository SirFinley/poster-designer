import { fabric } from "fabric";
import Overlay from './overlay';
import Settings from './settings';
import PosterImage from './image';
import Border from "./border";
import PosterEventHub from "./posterEventHub";

const canvas = new fabric.Canvas('fabric-canvas');

const eventHub = new PosterEventHub();
const settings = new Settings(canvas, eventHub);
// TODO: read settings from document.referrer
// readSettingsFromUrl(document.referrer);
settings.readSettingsFromUrl(window.location.toString());

const overlay = new Overlay(canvas, settings, eventHub);
const image = new PosterImage(canvas, settings, eventHub);
const border = new Border(canvas, settings, image, eventHub);

docReady(() => {
    resizeCanvas();
    setUpWelcomeText();
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
    border.drawBorder();
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

function setUpWelcomeText() {
    // TODO: remove this - load test image on start
    // let image = new fabric.Image(document.getElementById('cm-img') as HTMLImageElement);
    // this.setNewImage(image);
    // TODO: remove this - load test image on start

    if (image.image) {
        return;
    }

    let dims = settings.getVirtualDimensions();
    let text = new fabric.Textbox('Drag and drop your image here or upload from the side menu', {
        fill: 'black',
        fontSize: 72,
        left: dims.posterLeft,
        top: dims.posterTop,
        width: dims.posterWidth,
        height: dims.posterHeight,
        selectable: false,
        evented: false,
    });

    canvas.add(text);
    canvas.renderAll();

    eventHub.subscribe('imageChanged', () => {
        canvas.remove(text);
    });
}

// TODO: remove
(window as any).canvas = canvas; // TODO: remove this
(window as any).mySettings = settings; // TODO: remove this
(window as any).myImage = image; // TODO: remove this