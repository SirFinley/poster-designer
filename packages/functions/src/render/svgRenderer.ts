import sharp, { Sharp } from 'sharp';
import axios from 'axios';

import RenderSettings from "./renderSettings";
import { SaveData } from "./saveData";
import { getDownloadUrl } from './s3';

const svgTargetDpi = 600;

export default class SvgRenderer {
    async getRenderSettings(saveData: SaveData): Promise<RenderSettings> {
        const image = saveData.canvasImage;

        const dims = saveData.virtualDimensions;

        const imageRawWidth = image.width;
        const imageCanvasWidth = image.width * image.scaleX;

        const canvasPixelsPerInch = 1 / dims.inchesPerPixel;
        const imageWidthInInches = imageCanvasWidth / canvasPixelsPerInch;
        const imagePixelsPerInch = imageRawWidth / imageWidthInInches;

        const canvasMultiplier = imagePixelsPerInch / canvasPixelsPerInch;

        const allMultiplier = svgTargetDpi / imagePixelsPerInch;

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
            isSvg: true,
            extract,
            extend,
            svgScaledBy: allMultiplier,
        };
    }
    async render(id: string, saveData: SaveData): Promise<Sharp> {
        const renderSettings = await this.getRenderSettings(saveData);

        const pipeline = await this.getClippedImage(renderSettings);
        return pipeline.extract(renderSettings.extract)
            .extend(renderSettings.extend)
    }

    async getClippedImage(renderSettings: RenderSettings): Promise<Sharp> {
        const response = await axios.get(renderSettings.imgUrl, { responseType: 'arraybuffer' });
        const imgBuffer = Buffer.from(response.data, 'utf-8');

        const metadata = await sharp(imgBuffer).metadata();
        const density = renderSettings.svgScaledBy * (metadata.density || 72);
        return sharp(imgBuffer, {
            density,
            limitInputPixels: false,
        })
        .resize({
            width: renderSettings.image.width,
            height: renderSettings.image.height,
        });
    }

    async getImageUrl(saveData: SaveData): Promise<string> {
        return await getDownloadUrl(saveData.imageKey);
    }

}