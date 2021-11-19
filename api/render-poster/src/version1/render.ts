import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

import { SaveData } from "./SaveData";
import RenderSettings from './renderSettings';

export default class Render {
    async getRenderSettings(saveData: SaveData): Promise<RenderSettings> {
        let image = saveData.canvasImage;

        let dims = saveData.virtualDimensions;

        const imageRawWidth = image.width;
        const imageCanvasWidth = image.width * image.scaleX;

        let canvasPixelsPerInch = 1 / dims.inchesPerPixel;
        let imageWidthInInches = imageCanvasWidth / canvasPixelsPerInch;
        let imagePixelsPerInch = imageRawWidth / imageWidthInInches;

        let multiplier = imagePixelsPerInch / canvasPixelsPerInch;

        console.log('canvas dpi: ' + canvasPixelsPerInch);
        console.log('print dpi: ' + imagePixelsPerInch);
        console.log('render multiplier: ' + multiplier);

        let oldInchesFromLeft = (image.left - dims.posterLeft) / canvasPixelsPerInch;
        let oldInchesFromTop = (image.top - dims.posterTop) / canvasPixelsPerInch;
        let newLeft = Math.round(oldInchesFromLeft * imagePixelsPerInch);
        let newTop = Math.round(oldInchesFromTop * imagePixelsPerInch);

        const canvas = {
            width: Math.round(multiplier * dims.posterWidth),
            height: Math.round(multiplier * dims.posterHeight),
            backgroundColor: saveData.borders.color,
        };

        const borders = {
            left: Math.round(saveData.borders.left * imagePixelsPerInch),
            right: canvas.width - Math.round(saveData.borders.right * imagePixelsPerInch),
            top: Math.round(saveData.borders.top * imagePixelsPerInch),
            bottom: canvas.height - Math.round(saveData.borders.bottom * imagePixelsPerInch),
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
        // client
        // return this.image.image!.getSrc()
        // return 'https://visual-inkworks-dev.s3.amazonaws.com/1bec20b7-571c-4839-aa83-0b6bca99b6dc.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAY2RB5K65O5LDDGZY%2F20211119%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20211119T022553Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=eb9ae6e3140cba3c806cb7d117f6ba9784ad4456fc320e617c53076763f80f77';
        return 'https://visual-inkworks-dev.s3.amazonaws.com/9bb91e5c-d51a-4cb6-a893-3fee2ffbefe6.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAY2RB5K65O5LDDGZY%2F20211119%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20211119T031513Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=df98f5ba1d04f2484e4719a8d429b73adf6d56b04c9c0b171151f124636c0f46';

        // server
        // get s3 link for saveData.imageKey
    }

    async render(saveData: SaveData) {
        const renderSettings = await this.getRenderSettings(saveData);
        console.log(renderSettings);
        

        const canvas = createCanvas(renderSettings.canvas.width, renderSettings.canvas.height);
        const context = canvas.getContext('2d');

        // fill canvas with background color
        context.fillStyle = renderSettings.canvas.backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);


        // draw image
        let image = await loadImage(renderSettings.imgUrl);
        context.drawImage(image, renderSettings.image.left, renderSettings.image.top);


        // draw borders
        const borders = renderSettings.borders;
        context.fillStyle = borders.color;
        context.fillRect(0, 0, borders.left, canvas.height); // left
        context.fillRect(borders.right, 0, canvas.width - borders.right, canvas.height); // right
        context.fillRect(0, 0, canvas.width, borders.top); // top
        context.fillRect(0, borders.bottom, canvas.width, canvas.height - borders.bottom); // bottom


        // render
        const out = fs.createWriteStream(__dirname + '/helloworld.png');
        var stream = canvas.createPNGStream();
        stream.on('data', function (chunk) {
            out.write(chunk);
        });
        // TODO on 'error'
        // TODO on 'done'
    }
}