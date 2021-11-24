import { fabric } from 'fabric';
import PosterImage from "./image";
import Settings from "./settings";
import VirtualDimensions from './virtualDimensions';

export default class PosterExporter {
    async getSaveData(settings: Settings, canvas: fabric.Canvas, posterImage: PosterImage): Promise<SaveData> {
        if (!settings.originalImageKey) {
            throw Error('image key not found');
        }

        let image = posterImage.image!;

        fabric.Object.NUM_FRACTION_DIGITS = 17;

        return {
            version: 1,
            size: settings.size,
            orientation: settings.orientation,
            virtualDimensions: settings.getVirtualDimensions(),
            borders: {
                top: settings.verticalBorder,
                bottom: settings.verticalBorder,
                left: settings.sideBorder,
                right: settings.sideBorder,
                color: settings.borderColor,
            },
            canvasJson: await this.getCanvasJson(canvas),
            canvasImage: {
                left: image.left!,
                top: image.top!,
                width: image.width!,
                height: image.height!,
                scaleX: image.scaleX!,
                scaleY: image.scaleY!,
            },
            canvasObjectJsons: this.getCanvasObjectsJson(settings, canvas),
            imageKey: settings.originalImageKey,
        };
    }

    private getCanvasObjectsJson(settings: Settings, canvas: fabric.Canvas) {
        const objects = [];
        for (let obj of canvas.getObjects()) {
            // extend toObject to serialize name property
            obj.toObject = (function (toObject) {
                return function () {
                    // @ts-ignore
                    return fabric.util.object.extend(toObject.call(this), {
                        // @ts-ignore
                        name: this.name
                    });
                };
            })(obj.toObject);

            if (obj.type != 'image') {
                objects.push(JSON.stringify(obj));
            }
            else {
                // assuming this is the only image on the poster
                const img = JSON.parse(JSON.stringify(obj));
                img.src = 's3://' + settings.originalImageKey; // replace long dataURL with s3 key
                objects.push(JSON.stringify(img));
            }
        };

        return objects;
    }

    private async getCanvasJson(canvas: fabric.Canvas) {
        return new Promise<string>((resolve, reject) => {
            let clone = new fabric.StaticCanvas(null);
            clone.loadFromJSON(canvas.toJSON(), async () => {
                clone.overlayImage = undefined;
                clone.remove(...clone.getObjects());
                resolve(clone.toJSON());
            });
        });
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