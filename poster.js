import { fabric } from "fabric";
import Overlay from './src/overlay';
import Settings from './src/settings';
const canvas = new fabric.Canvas('canvas');
let settings = new Settings();
let overlay = new Overlay(canvas);
// TODO: read settings from document.referrer
// readSettingsFromUrl(document.referrer);
settings.readSettingsFromUrl(window.location.toString());
