export default interface VirtualDimensions {
    canvasWidth: number,
    canvasHeight: number,
    canvasAspectRatio: number,
    canvasHorizontalMargin: number,
    canvasVerticalMargin: number,

    inchesPerPixel: number

    posterAspectRatio: number,
    posterWidth: number,
    posterHeight: number,

    posterLeft: number;
    posterRight: number;
    posterTop: number;
    posterBottom: number;

    borderWidth: number,
    borderHeight: number,
    posterInnerBorderWidth: number,
    posterInnerBorderHeight: number,
    posterLeftBorder: number,
    posterRightBorder: number,
    posterTopBorder: number,
    posterBottomBorder: number,
    borderInnerAspectRatio: number,
}