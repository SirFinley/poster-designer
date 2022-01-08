import { fabric } from 'fabric';
import Settings from "./settings";

export default class PosterRender {

    async getDataURL(settings: Settings, canvas: fabric.Canvas, targetMaxSize: number): Promise<string> {
        const dims = settings.getVirtualDimensions();
        const longestSide = Math.max(dims.posterWidth, dims.posterHeight);
        const multiplier = targetMaxSize / longestSide;

        async function cloneCanvas(): Promise<fabric.StaticCanvas> {
            return new Promise((resolve, reject) => {
                canvas.clone((clone: fabric.StaticCanvas) => {

                    // remove border lines
                    clone.getObjects().forEach((obj) => {
                        if (obj.name === 'border-line') {
                            clone.remove(obj);
                        }
                    })

                    clone.renderAll();
                    resolve(clone);
                }, ['name']);
            });
        }

        const canvasClone = await cloneCanvas();
        const dataURL = canvasClone.toDataURL({
            width: dims.posterWidth,
            height: dims.posterHeight,
            left: dims.posterLeft,
            top: dims.posterTop,
            format: 'png',
            multiplier,
        });

        return dataURL;
    }
}