export default interface RenderSettings {
    imgUrl: string,
    borders: {
        left: number,
        right: number,
        top: number,
        bottom: number,
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