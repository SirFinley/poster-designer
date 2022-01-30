import sharp from 'sharp';
import axios from 'axios';

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
        const isSvg = /\.svg/.test(saveData.imageKey);
        if (isSvg) {
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

        const cropWidthInches = image.cropWidth / canvasPixelsPerInch;
        const cropHeightInches = image.cropHeight / canvasPixelsPerInch;
        const extract = {
            left: borders.leftWidth - Math.round(allMultiplier * oldInchesFromLeft * imagePixelsPerInch),
            top: borders.topWidth - Math.round(allMultiplier * oldInchesFromTop * imagePixelsPerInch),
            width: Math.round(allMultiplier * cropWidthInches * imagePixelsPerInch),
            height: Math.round(allMultiplier * cropHeightInches * imagePixelsPerInch),
        };
        const extend = {
            top: Math.round(Math.max(0, (canvas.height - extract.height)/2)),
            bottom: Math.round(Math.max(0, (canvas.height - extract.height)/2)),
            left: Math.round(Math.max(0, (canvas.width - extract.width)/2)),
            right: Math.round(Math.max(0, (canvas.width - extract.width)/2)),
            background: saveData.borders.color,
        };

        return {
            borders,
            canvas,
            image: newImage,
            imgUrl: await this.getImageUrl(saveData),
            isSvg,
            extract,
            extend,
            svgScaledBy: allMultiplier,
        };
    }

    async getImageUrl(saveData: SaveData): Promise<string> {
        return await getDownloadUrl(saveData.imageKey);
    }

    async render(id: string, saveData: SaveData): Promise<RenderKeys> {
        const renderSettings = await this.getRenderSettings(saveData);

        const response = await axios.get(renderSettings.imgUrl, { responseType: 'arraybuffer' });
        const imgBuffer = Buffer.from(response.data, 'utf-8');

        let main;
        if (renderSettings.isSvg) {
            const metadata = await sharp(imgBuffer).metadata();
            console.log('density: ' + metadata.density);
            const density = renderSettings.svgScaledBy * metadata.density;
            main = sharp(imgBuffer, {
                density,
                limitInputPixels: false,
            });
        
            main = main.resize({
                width: renderSettings.image.width,
                height: renderSettings.image.height,
            });
        }
        else {
            main = sharp(imgBuffer, {
                limitInputPixels: false,
            });
        }

        const outBuffer = await main.extract(renderSettings.extract)
            .extend(renderSettings.extend)
            .toFormat('png')
            .toBuffer();

        // save full render
        const fullRenderKey = `${id}/full-render.png`;
        await uploadImage(outBuffer, fullRenderKey);

        // save preview-render
        const previewRenderKey = `${id}/preview-render.png`;
        await uploadImage(outBuffer, previewRenderKey);

        return {
            fullRenderKey,
            previewRenderKey
        };
    }

}

export interface RenderKeys {
    fullRenderKey: string,
    previewRenderKey: string,
}