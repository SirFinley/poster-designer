import { Canvas, createCanvas, loadImage } from 'canvas';

import { SaveData } from "./saveData";
import RenderSettings from './renderSettings';
import { getDownloadUrl, uploadImage } from './s3';

const svgTargetDpi = 600;
export default class Render {
    async getRenderSettings(saveData: SaveData): Promise<RenderSettings> {
        const image = saveData.canvasImage;

        const dims = saveData.virtualDimensions;

        const imageRawWidth = image.width;
        const imageCanvasWidth = image.width * image.scaleX;

        const canvasPixelsPerInch = 1 / dims.inchesPerPixel;
        const imageWidthInInches = imageCanvasWidth / canvasPixelsPerInch;
        const imagePixelsPerInch = imageRawWidth / imageWidthInInches;

        const canvasMultiplier = imagePixelsPerInch / canvasPixelsPerInch;

        let allMultiplier = 1;
        // if svg, scale everything to reach target dpi
        if (/\.svg/.test(saveData.imageKey)) {
            allMultiplier = svgTargetDpi / imagePixelsPerInch;
        }

        console.log('canvas dpi: ' + canvasPixelsPerInch);
        console.log('print dpi: ' + imagePixelsPerInch);
        console.log('render multiplier: ' + canvasMultiplier);

        // round all coordinates and sizes to integers to avoid subpixel rendering

        const canvas = {
            width: Math.round(allMultiplier * canvasMultiplier * dims.posterWidth),
            height: Math.round(allMultiplier * canvasMultiplier * dims.posterHeight),
            backgroundColor: saveData.borders.color,
        };

        const borders = {
            leftWidth: Math.round(allMultiplier * saveData.borders.left * imagePixelsPerInch),
            rightWidth: Math.round(allMultiplier * saveData.borders.right * imagePixelsPerInch),
            topWidth: Math.round(allMultiplier * saveData.borders.top * imagePixelsPerInch),
            bottomWidth: Math.round(allMultiplier * saveData.borders.bottom * imagePixelsPerInch),
            color: saveData.borders.color,
        };


        const oldInchesFromLeft = (image.left - dims.posterLeft) / canvasPixelsPerInch;
        const oldInchesFromTop = (image.top - dims.posterTop) / canvasPixelsPerInch;
        const newImage = {
            left: Math.round(allMultiplier * oldInchesFromLeft * imagePixelsPerInch),
            top: Math.round(allMultiplier * oldInchesFromTop * imagePixelsPerInch),
            width: Math.round(allMultiplier * image.width),
            height: Math.round(allMultiplier * image.height),
        };

        return {
            borders,
            canvas,
            image: newImage,
            imgUrl: await this.getImageUrl(saveData),
        };
    }

    async getImageUrl(saveData: SaveData): Promise<string> {
        return await getDownloadUrl(saveData.imageKey);
    }

    async render(id: string, saveData: SaveData): Promise<RenderKeys> {
        const renderSettings = await this.getRenderSettings(saveData);

        const canvas = createCanvas(renderSettings.canvas.width, renderSettings.canvas.height);
        const context = canvas.getContext('2d', { alpha: false, });

        // fill canvas with background color
        context.fillStyle = renderSettings.canvas.backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);


        // draw image
        const image = await loadImage(renderSettings.imgUrl);
        image.width = renderSettings.image.width;
        image.height = renderSettings.image.height;
        context.drawImage(image, renderSettings.image.left, renderSettings.image.top, renderSettings.image.width, renderSettings.image.height);


        // draw borders
        const borders = renderSettings.borders;
        context.fillStyle = borders.color;
        context.fillRect(0, 0, canvas.width, borders.topWidth); // top
        context.fillRect(0, canvas.height - borders.bottomWidth, canvas.width, borders.bottomWidth); // bottom

        const sidesHeight = canvas.height - (borders.topWidth + borders.bottomWidth);
        context.fillRect(0, borders.topWidth, borders.leftWidth, sidesHeight); // left
        context.fillRect(canvas.width - borders.rightWidth, borders.topWidth, borders.rightWidth, sidesHeight); // right

        // save full render
        const fullRenderKey = `${id}/full-render.png`;
        await uploadImage(canvas.toBuffer(), fullRenderKey);

        // save preview-render
        const previewCanvas = this.getPreviewCanvas(canvas);
        const previewRenderKey = `${id}/preview-render.png`;
        await uploadImage(previewCanvas.toBuffer(), previewRenderKey);

        return {
            fullRenderKey,
            previewRenderKey
        };
    }

    getPreviewCanvas(otherCanvas: Canvas) {
        const maxSide = 300;
        const scale = maxSide / Math.max(otherCanvas.width, otherCanvas.height);

        const canvas = createCanvas(otherCanvas.width * scale, otherCanvas.height * scale);
        const context = canvas.getContext('2d', { alpha: false });

        context.scale(scale, scale);
        context.drawImage(otherCanvas, 0, 0);

        return canvas;
    }
}

export interface RenderKeys {
    fullRenderKey: string,
    previewRenderKey: string,
}