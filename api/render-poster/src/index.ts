import fs from 'fs';
import VirtualDimensions from './virtualDimensions';
import { createCanvas, loadImage } from 'canvas';

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
        return 'https://visual-inkworks-dev.s3.amazonaws.com/1bec20b7-571c-4839-aa83-0b6bca99b6dc.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAY2RB5K65O5LDDGZY%2F20211119%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20211119T022553Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=eb9ae6e3140cba3c806cb7d117f6ba9784ad4456fc320e617c53076763f80f77';

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
        context.fillRect(0, 0, renderSettings.canvas.width, renderSettings.canvas.height);


        // draw image
        let image = await loadImage(renderSettings.imgUrl);
        context.drawImage(image, renderSettings.image.left, renderSettings.image.top);


        // draw borders
        context.fillStyle = renderSettings.borders.color;
        context.fillRect(0, 0, renderSettings.borders.left, canvas.height); // left
        context.fillRect(renderSettings.borders.right, 0, canvas.width - renderSettings.borders.right, canvas.height); // right
        context.fillRect(0, 0, canvas.width, renderSettings.borders.top);
        context.fillRect(0, renderSettings.borders.bottom, canvas.width, canvas.height - renderSettings.borders.bottom);


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

interface RenderSettings {
    imgUrl: string,
    borders: {
        left: number,
        right: number,
        top: number,
        bottom: number,
        color: string,
    },
    image: {
        left: number,
        top: number,
    },
    canvas: {
        width: number,
        height: number,
        backgroundColor: string,
    }
}

export interface SaveData {
    version: number,
    size: string,
    orientation: string,
    virtualDimensions: VirtualDimensions
    borders: {
        top: number,
        bottom: number,
        left: number,
        right: number,
        color: string,
    },
    canvasJson: string,
    canvasImage: {
        left: number,
        top: number,
        width: number,
        height: number,
        scaleX: number,
        scaleY: number,
    },
    canvasObjectJsons: string[],
    imageKey: string,
}

// TODO: read save data from dynamo
// TODO: load image from s3
// TODO: save rendered image to s3
// TODO: save thumbnail image to s3

// testing
const saveDataJson = "{\"version\":1,\"size\":\"8.5x11\",\"orientation\":\"portrait\",\"virtualDimensions\":{\"canvasWidth\":987,\"canvasHeight\":856,\"canvasAspectRatio\":1.15303738317757,\"canvasHorizontalMargin\":195.84545454545457,\"canvasVerticalMargin\":42.80000000000001,\"inchesPerPixel\":0.014278296988577363,\"posterAspectRatio\":0.7727272727272727,\"posterWidth\":595.3090909090909,\"posterHeight\":770.4,\"posterLeft\":195.84545454545457,\"posterRight\":791.1545454545454,\"posterTop\":42.80000000000001,\"posterBottom\":813.2,\"borderWidth\":0,\"borderHeight\":0,\"posterLeftBorder\":195.84545454545457,\"posterRightBorder\":791.1545454545454,\"posterTopBorder\":42.80000000000001,\"posterBottomBorder\":813.2,\"posterInnerBorderWidth\":595.3090909090909,\"posterInnerBorderHeight\":770.4000000000001,\"borderInnerAspectRatio\":0.7727272727272726},\"borders\":{\"horizontal\":0,\"vertical\":0,\"color\":\"#fffee0\"},\"canvasJson\":{\"version\":\"4.6.0\",\"objects\":[],\"background\":\"#fffee0\"},\"canvasImage\":{\"left\":365.1,\"top\":42.80000000000001,\"width\":4500,\"height\":13500,\"scaleX\":0.057066666666666675,\"scaleY\":0.057066666666666675},\"canvasObjectJsons\":[\"{\\\"type\\\":\\\"image\\\",\\\"version\\\":\\\"4.6.0\\\",\\\"originX\\\":\\\"left\\\",\\\"originY\\\":\\\"top\\\",\\\"left\\\":365.1,\\\"top\\\":42.80000000000001,\\\"width\\\":4500,\\\"height\\\":13500,\\\"fill\\\":\\\"rgb(0,0,0)\\\",\\\"stroke\\\":null,\\\"strokeWidth\\\":0,\\\"strokeDashArray\\\":null,\\\"strokeLineCap\\\":\\\"butt\\\",\\\"strokeDashOffset\\\":0,\\\"strokeLineJoin\\\":\\\"miter\\\",\\\"strokeUniform\\\":false,\\\"strokeMiterLimit\\\":4,\\\"scaleX\\\":0.05706666666666668,\\\"scaleY\\\":0.05706666666666668,\\\"angle\\\":0,\\\"flipX\\\":false,\\\"flipY\\\":false,\\\"opacity\\\":1,\\\"shadow\\\":null,\\\"visible\\\":true,\\\"backgroundColor\\\":\\\"\\\",\\\"fillRule\\\":\\\"nonzero\\\",\\\"paintFirst\\\":\\\"fill\\\",\\\"globalCompositeOperation\\\":\\\"source-over\\\",\\\"skewX\\\":0,\\\"skewY\\\":0,\\\"clipPath\\\":{\\\"type\\\":\\\"rect\\\",\\\"version\\\":\\\"4.6.0\\\",\\\"originX\\\":\\\"left\\\",\\\"originY\\\":\\\"top\\\",\\\"left\\\":195.84545454545457,\\\"top\\\":42.80000000000001,\\\"width\\\":595.3090909090909,\\\"height\\\":770.4000000000001,\\\"fill\\\":\\\"rgb(0,0,0)\\\",\\\"stroke\\\":null,\\\"strokeWidth\\\":1,\\\"strokeDashArray\\\":null,\\\"strokeLineCap\\\":\\\"butt\\\",\\\"strokeDashOffset\\\":0,\\\"strokeLineJoin\\\":\\\"miter\\\",\\\"strokeUniform\\\":false,\\\"strokeMiterLimit\\\":4,\\\"scaleX\\\":1,\\\"scaleY\\\":1,\\\"angle\\\":0,\\\"flipX\\\":false,\\\"flipY\\\":false,\\\"opacity\\\":1,\\\"shadow\\\":null,\\\"visible\\\":true,\\\"backgroundColor\\\":\\\"\\\",\\\"fillRule\\\":\\\"nonzero\\\",\\\"paintFirst\\\":\\\"fill\\\",\\\"globalCompositeOperation\\\":\\\"source-over\\\",\\\"skewX\\\":0,\\\"skewY\\\":0,\\\"rx\\\":0,\\\"ry\\\":0,\\\"inverted\\\":false,\\\"absolutePositioned\\\":true},\\\"cropX\\\":0,\\\"cropY\\\":0,\\\"src\\\":\\\"s3://4fbe8f2c-ab0b-4a9d-86ab-4cf37f8d223a.png\\\",\\\"crossOrigin\\\":null,\\\"filters\\\":[],\\\"name\\\":\\\"main-image\\\"}\",\"{\\\"type\\\":\\\"line\\\",\\\"version\\\":\\\"4.6.0\\\",\\\"originX\\\":\\\"left\\\",\\\"originY\\\":\\\"top\\\",\\\"left\\\":195.84545454545457,\\\"top\\\":0,\\\"width\\\":0,\\\"height\\\":856,\\\"fill\\\":\\\"rgb(0,0,0)\\\",\\\"stroke\\\":\\\"#000360\\\",\\\"strokeWidth\\\":1,\\\"strokeDashArray\\\":[6,6],\\\"strokeLineCap\\\":\\\"butt\\\",\\\"strokeDashOffset\\\":0,\\\"strokeLineJoin\\\":\\\"miter\\\",\\\"strokeUniform\\\":false,\\\"strokeMiterLimit\\\":4,\\\"scaleX\\\":1,\\\"scaleY\\\":1,\\\"angle\\\":0,\\\"flipX\\\":false,\\\"flipY\\\":false,\\\"opacity\\\":0.8,\\\"shadow\\\":null,\\\"visible\\\":true,\\\"backgroundColor\\\":\\\"\\\",\\\"fillRule\\\":\\\"nonzero\\\",\\\"paintFirst\\\":\\\"fill\\\",\\\"globalCompositeOperation\\\":\\\"source-over\\\",\\\"skewX\\\":0,\\\"skewY\\\":0,\\\"x1\\\":0,\\\"x2\\\":0,\\\"y1\\\":-428,\\\"y2\\\":428,\\\"name\\\":\\\"border-line\\\"}\",\"{\\\"type\\\":\\\"line\\\",\\\"version\\\":\\\"4.6.0\\\",\\\"originX\\\":\\\"left\\\",\\\"originY\\\":\\\"top\\\",\\\"left\\\":791.1545454545454,\\\"top\\\":0,\\\"width\\\":0,\\\"height\\\":856,\\\"fill\\\":\\\"rgb(0,0,0)\\\",\\\"stroke\\\":\\\"#000360\\\",\\\"strokeWidth\\\":1,\\\"strokeDashArray\\\":[6,6],\\\"strokeLineCap\\\":\\\"butt\\\",\\\"strokeDashOffset\\\":0,\\\"strokeLineJoin\\\":\\\"miter\\\",\\\"strokeUniform\\\":false,\\\"strokeMiterLimit\\\":4,\\\"scaleX\\\":1,\\\"scaleY\\\":1,\\\"angle\\\":0,\\\"flipX\\\":false,\\\"flipY\\\":false,\\\"opacity\\\":0.8,\\\"shadow\\\":null,\\\"visible\\\":true,\\\"backgroundColor\\\":\\\"\\\",\\\"fillRule\\\":\\\"nonzero\\\",\\\"paintFirst\\\":\\\"fill\\\",\\\"globalCompositeOperation\\\":\\\"source-over\\\",\\\"skewX\\\":0,\\\"skewY\\\":0,\\\"x1\\\":0,\\\"x2\\\":0,\\\"y1\\\":-428,\\\"y2\\\":428,\\\"name\\\":\\\"border-line\\\"}\",\"{\\\"type\\\":\\\"line\\\",\\\"version\\\":\\\"4.6.0\\\",\\\"originX\\\":\\\"left\\\",\\\"originY\\\":\\\"top\\\",\\\"left\\\":0,\\\"top\\\":42.80000000000001,\\\"width\\\":987,\\\"height\\\":0,\\\"fill\\\":\\\"rgb(0,0,0)\\\",\\\"stroke\\\":\\\"#000360\\\",\\\"strokeWidth\\\":1,\\\"strokeDashArray\\\":[6,6],\\\"strokeLineCap\\\":\\\"butt\\\",\\\"strokeDashOffset\\\":0,\\\"strokeLineJoin\\\":\\\"miter\\\",\\\"strokeUniform\\\":false,\\\"strokeMiterLimit\\\":4,\\\"scaleX\\\":1,\\\"scaleY\\\":1,\\\"angle\\\":0,\\\"flipX\\\":false,\\\"flipY\\\":false,\\\"opacity\\\":0.8,\\\"shadow\\\":null,\\\"visible\\\":true,\\\"backgroundColor\\\":\\\"\\\",\\\"fillRule\\\":\\\"nonzero\\\",\\\"paintFirst\\\":\\\"fill\\\",\\\"globalCompositeOperation\\\":\\\"source-over\\\",\\\"skewX\\\":0,\\\"skewY\\\":0,\\\"x1\\\":-493.5,\\\"x2\\\":493.5,\\\"y1\\\":0,\\\"y2\\\":0,\\\"name\\\":\\\"border-line\\\"}\",\"{\\\"type\\\":\\\"line\\\",\\\"version\\\":\\\"4.6.0\\\",\\\"originX\\\":\\\"left\\\",\\\"originY\\\":\\\"top\\\",\\\"left\\\":0,\\\"top\\\":813.2,\\\"width\\\":987,\\\"height\\\":0,\\\"fill\\\":\\\"rgb(0,0,0)\\\",\\\"stroke\\\":\\\"#000360\\\",\\\"strokeWidth\\\":1,\\\"strokeDashArray\\\":[6,6],\\\"strokeLineCap\\\":\\\"butt\\\",\\\"strokeDashOffset\\\":0,\\\"strokeLineJoin\\\":\\\"miter\\\",\\\"strokeUniform\\\":false,\\\"strokeMiterLimit\\\":4,\\\"scaleX\\\":1,\\\"scaleY\\\":1,\\\"angle\\\":0,\\\"flipX\\\":false,\\\"flipY\\\":false,\\\"opacity\\\":0.8,\\\"shadow\\\":null,\\\"visible\\\":true,\\\"backgroundColor\\\":\\\"\\\",\\\"fillRule\\\":\\\"nonzero\\\",\\\"paintFirst\\\":\\\"fill\\\",\\\"globalCompositeOperation\\\":\\\"source-over\\\",\\\"skewX\\\":0,\\\"skewY\\\":0,\\\"x1\\\":-493.5,\\\"x2\\\":493.5,\\\"y1\\\":0,\\\"y2\\\":0,\\\"name\\\":\\\"border-line\\\"}\"],\"imageKey\":\"4fbe8f2c-ab0b-4a9d-86ab-4cf37f8d223a.png\"}";
const saveData = JSON.parse(saveDataJson) as SaveData;

    saveData.borders.left = 0.25;
    saveData.borders.top = 0.5;
    saveData.borders.right = 0.75;
    saveData.borders.bottom = 1;
    // saveData.borders.color = '#ffffff';
// testing

new Render().render(saveData);