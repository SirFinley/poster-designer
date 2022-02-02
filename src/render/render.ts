import { SaveData } from "./saveData";
import { uploadImage } from './s3';
import SvgRenderer from "./svgRenderer";
import RasterRenderer from "./rasterRenderer";
export default class Render {

    async render(id: string, saveData: SaveData): Promise<RenderKeys> {
        let pipeline;
        // if svg, scale everything to reach target dpi
        const isSvg = /\.svg/.test(saveData.imageKey);
        if (isSvg) {
            pipeline = await new SvgRenderer().render(id, saveData);
        }
        else {
            pipeline = await new RasterRenderer().render(id, saveData);
        }

        const outBuffer = await pipeline
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