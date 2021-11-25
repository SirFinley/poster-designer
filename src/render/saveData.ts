import VirtualDimensions from "./virtualDimensions";

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