import { fabric } from 'fabric';
import PosterImage from "./image";
import ImageUploader from './imageUploader';
import Settings from "./settings";
import VirtualDimensions from './virtualDimensions';

export default class PosterExporter {
    async getSaveData(settings: Settings, canvas: fabric.Canvas, posterImage: PosterImage): Promise<SaveData> {
        if (!settings.originalImageKey) {
            throw Error('image key not found');
        }

        const image = posterImage.image!;

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
            imageThumbnailKey: await this.uploadImageThumbnail(settings, canvas),
        };
    }

    async uploadImageThumbnail(settings: Settings, canvas: fabric.Canvas): Promise<string> {
        const targetMaxSize = 300;
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
                });
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

        function dataURLtoFile(dataurl: string, filename: string) {

            const arr = dataurl.split(',');
            const mime = arr[0].match(/:(.*?);/)![1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);

            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }

            return new File([u8arr], filename, { type: mime });
        }

        let thumbnailKey = '';
        const file = dataURLtoFile(dataURL, 'thumbnail.png');
        const imgUploader = new ImageUploader(settings, {
            onComplete: (key) => thumbnailKey = key,
        });
        await imgUploader.start(file);

        return thumbnailKey;
    }

    private getCanvasObjectsJson(settings: Settings, canvas: fabric.Canvas) {
        const objects = [];
        for (const obj of canvas.getObjects()) {
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

            if (obj.type !== 'image') {
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
            const clone = new fabric.StaticCanvas(null);
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
    imageThumbnailKey: string,
}