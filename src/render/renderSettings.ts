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
    },
    canvas: {
        width: number,
        height: number,
        backgroundColor: string,
    }
}