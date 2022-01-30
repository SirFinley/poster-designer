export default interface RenderSettings {
    imgUrl: string,
    borders: {
        leftWidth: number,
        rightWidth: number,
        topWidth: number,
        bottomWidth: number,
        color: string,
    },
    image: {
        left: number,
        top: number,
        width: number,
        height: number,
    },
    canvas: {
        width: number,
        height: number,
        backgroundColor: string,
    },
    isSvg: boolean,
    svgScaledBy: number,
    extract: {
        left: number,
        top: number,
        width: number,
        height: number,
    },
    extend: {
        top: number,
        bottom: number,
        left: number,
        right: number,
        background: string,
    },
}