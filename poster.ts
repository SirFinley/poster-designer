import { fabric } from "fabric";
import Overlay from './src/overlay';
import Settings from './src/settings';
import PosterImage from './src/image';

const canvas = new fabric.Canvas('canvas');
let settings = new Settings();
// TODO: read settings from document.referrer
// readSettingsFromUrl(document.referrer);
settings.readSettingsFromUrl(window.location.toString());

let overlay = new Overlay(canvas, settings);
let image = new PosterImage(canvas, settings);
