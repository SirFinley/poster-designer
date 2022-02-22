import sharp, { Sharp } from 'sharp';
import axios from 'axios';

import RenderSettings from "./renderSettings";
import { SaveData } from "./saveData";
import { getDownloadUrl } from './s3';

export default class RasterRenderer {
    async getRenderSettings(saveData: SaveData): Promise<RenderSettings> {
        const image = saveData.canvasImage;

        const dims = saveData.virtualDimensions;

        const imageRawWidth = image.width;
        const imageCanvasWidth = image.width * image.scaleX;

        const canvasPixelsPerInch = 1 / dims.inchesPerPixel;
        const imageWidthInInches = imageCanvasWidth / canvasPixelsPerInch;
        const imagePixelsPerInch = imageRawWidth / imageWidthInInches;

        const canvasMultiplier = imagePixelsPerInch / canvasPixelsPerInch;

        console.log('canvas dpi: ' + canvasPixelsPerInch);
        console.log('print dpi: ' + imagePixelsPerInch);
        console.log('render multiplier: ' + canvasMultiplier);

        // round all coordinates and sizes to integers to avoid subpixel rendering
        const canvas = {
            width: Math.round(canvasMultiplier * dims.posterWidth),
            height: Math.round(canvasMultiplier * dims.posterHeight),
            backgroundColor: saveData.borders.color,
        };

        const borders = {
            leftWidth: Math.round(saveData.borders.left * imagePixelsPerInch),
            rightWidth: Math.round(saveData.borders.right * imagePixelsPerInch),
            topWidth: Math.round(saveData.borders.top * imagePixelsPerInch),
            bottomWidth: Math.round(saveData.borders.bottom * imagePixelsPerInch),
            color: saveData.borders.color,
        };


        const oldInchesFromLeft = (image.left - dims.posterLeft) / canvasPixelsPerInch;
        const oldInchesFromTop = (image.top - dims.posterTop) / canvasPixelsPerInch;
        const newImage = {
            left: Math.round(oldInchesFromLeft * imagePixelsPerInch),
            top: Math.round(oldInchesFromTop * imagePixelsPerInch),
            width: Math.round(image.width),
            height: Math.round(image.height),
        };

        const imageScaledWidth = image.width * image.scaleX;
        const imageRight = image.left + imageScaledWidth;
        const imageScaledHeight = image.height * image.scaleY;
        const imageBottom = image.top + imageScaledHeight;
        const imageClip: any = {
            left: Math.round((dims.posterLeftBorder - image.left) / image.scaleX),
            top: Math.round((dims.posterTopBorder - image.top) / image.scaleY),
            right: Math.round((imageRight - dims.posterRightBorder) / image.scaleX),
            bottom: Math.round((imageBottom - dims.posterBottomBorder) / image.scaleY),
        };
        imageClip.width = Math.round(image.width - Math.max(0, imageClip.left) - Math.max(0, imageClip.right));
        imageClip.height = Math.round(image.height - Math.max(0, imageClip.top) - Math.max(0, imageClip.bottom));

        const extract = {
            left: Math.max(0, imageClip.left),
            top: Math.max(0, imageClip.top),
            width: Math.min(image.width, imageClip.width),
            height: Math.min(image.height, imageClip.height),
        };


        const extend = {
            left: Math.round(imageClip.left >= 0 ? borders.leftWidth : (image.left - dims.posterLeft) / image.scaleX),
            top: Math.round(imageClip.top >= 0 ? borders.topWidth : (image.top - dims.posterTop) / image.scaleY),
            right: Math.round(imageClip.right >= 0 ? borders.rightWidth : Math.abs(imageRight - dims.posterRight) / image.scaleX),
            bottom: Math.round(imageClip.bottom >= 0 ? borders.bottomWidth : Math.abs(imageBottom - dims.posterBottom) / image.scaleY),
            background: saveData.borders.color,
        };

        return {
            borders,
            canvas,
            image: newImage,
            imgUrl: await this.getImageUrl(saveData),
            isSvg: false,
            extract,
            extend,
            svgScaledBy: 0,
        };
    }

    async getImageUrl(saveData: SaveData): Promise<string> {
        return await getDownloadUrl(saveData.imageKey);
    }

    async render(id: string, saveData: SaveData): Promise<Sharp> {
        const renderSettings = await this.getRenderSettings(saveData);

        const response = await axios.get(renderSettings.imgUrl, { responseType: 'arraybuffer' });
        const imgBuffer = Buffer.from(response.data, 'utf-8');
        const pipeline =  sharp(imgBuffer, {
            limitInputPixels: false,
        })
        .rotate(); // rotate image based on exif data
        return pipeline.extract(renderSettings.extract)
            .extend(renderSettings.extend)
    }

}
