import { Canvas, createCanvas, loadImage } from 'canvas';

import { SaveData } from "./saveData";
import RenderSettings from './renderSettings';
import { getDownloadUrl, uploadImage } from './s3';

export default class Render {
    async getRenderSettings(saveData: SaveData): Promise<RenderSettings> {
        const image = saveData.canvasImage;

        const dims = saveData.virtualDimensions;

        const imageRawWidth = image.width;
        const imageCanvasWidth = image.width * image.scaleX;

        const canvasPixelsPerInch = 1 / dims.inchesPerPixel;
        const imageWidthInInches = imageCanvasWidth / canvasPixelsPerInch;
        const imagePixelsPerInch = imageRawWidth / imageWidthInInches;

        const multiplier = imagePixelsPerInch / canvasPixelsPerInch;

        console.log('canvas dpi: ' + canvasPixelsPerInch);
        console.log('print dpi: ' + imagePixelsPerInch);
        console.log('render multiplier: ' + multiplier);

        const oldInchesFromLeft = (image.left - dims.posterLeft) / canvasPixelsPerInch;
        const oldInchesFromTop = (image.top - dims.posterTop) / canvasPixelsPerInch;
        const newLeft = Math.round(oldInchesFromLeft * imagePixelsPerInch);
        const newTop = Math.round(oldInchesFromTop * imagePixelsPerInch);

        const canvas = {
            width: Math.round(multiplier * dims.posterWidth),
            height: Math.round(multiplier * dims.posterHeight),
            backgroundColor: saveData.borders.color,
        };

        const borders = {
            leftWidth: Math.round(saveData.borders.left * imagePixelsPerInch),
            rightWidth: Math.round(saveData.borders.right * imagePixelsPerInch),
            topWidth: Math.round(saveData.borders.top * imagePixelsPerInch),
            bottomWidth: Math.round(saveData.borders.bottom * imagePixelsPerInch),
            color: saveData.borders.color,
        };

        const newImage = {
            left: newLeft,
            top: newTop,
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
        const context = canvas.getContext('2d', { alpha: false,  });

        // fill canvas with background color
        context.fillStyle = renderSettings.canvas.backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);


        // draw image
        const image = await loadImage(renderSettings.imgUrl);
        context.drawImage(image, renderSettings.image.left, renderSettings.image.top);


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

// function saveToFile(canvas: Canvas, fileName: string) {
        // const stream = canvas.createPNGStream();
        // const out = fs.createWriteStream(__dirname + fileName);
        // stream.on('data', function (chunk) {
        //     out.write(chunk);
        // });
// }

export interface RenderKeys {
    fullRenderKey: string,
    previewRenderKey: string,
}