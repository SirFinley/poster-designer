import { fabric } from "fabric";
import Overlay from './overlay';
import Settings from './settings';
import PosterImage from './image';

const canvasElem = document.getElementById('canvas') as HTMLCanvasElement;
canvasElem.width = canvasElem.parentElement.offsetWidth;
canvasElem.height = canvasElem.parentElement.offsetHeight;

const canvas = new fabric.Canvas('canvas');
let settings = new Settings();
// TODO: read settings from document.referrer
// readSettingsFromUrl(document.referrer);
settings.readSettingsFromUrl(window.location.toString());

let overlay = new Overlay(canvas, settings);
let image = new PosterImage(canvas, settings);
