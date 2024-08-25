import VirtualDimensions from "./virtualDimensions";

export interface SaveData {
    idType: 'autoinc'|'guid',
    version: number,
    size: string,
    orientation: string,
    paper: string,
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
        // TODO: remove cropWidth?
        cropWidth: number,
        cropHeight: number,
    },
    canvasObjectJsons: string[],
    imageKey: string,
    imageThumbnailKey: string,
}