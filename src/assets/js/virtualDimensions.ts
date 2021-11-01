export default interface VirtualDimensions {
    canvasWidth: number,
    canvasHeight: number,
    canvasAspectRatio: number,
    canvasHorizontalMargin: number,
    canvasVerticalMargin: number,

    posterAspectRatio: number,
    posterWidth: number,
    posterHeight: number,

    posterLeft: number;
    posterRight: number;
    posterTop: number;
    posterBottom: number;

    posterLeftMargin: number,
    posterRightMargin: number,
    posterTopMargin: number,
    posterBottomMargin: number,
}