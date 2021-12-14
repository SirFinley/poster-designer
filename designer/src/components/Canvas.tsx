import { useEffect } from 'react';
import poster from '../class/poster';
import { fabric } from 'fabric';

function Canvas() {

    useEffect(() => {
        const canvas = initCanvas();

        const canvasResizeObserver = new ResizeObserver((entries) => resizeCanvas(canvas, entries));
        const canvasElem = document.getElementById('fabric-canvas-wrapper')!;
        canvasResizeObserver.observe(canvasElem);
        poster.setCanvas(canvas);
    }, [])

    const initCanvas = () => {
        const canvas = new fabric.Canvas('fabric-canvas', {
            width: 400,
            height: 400,
        });

        // enforce uniform scaling
        canvas.uniformScaling = true;
        canvas.uniScaleKey = '';

        return canvas;
    }

    return (
        <div id="fabric-canvas-wrapper" className="flex-grow flex-1 self-stretch" style={{ minWidth: '200px' }}>
            <canvas id="fabric-canvas" className="drop-area"><p>hello</p></canvas>
        </div>
    );
}

function resizeCanvas(canvas: fabric.Canvas, entries: ResizeObserverEntry[]) {
    if (entries.length !== 1) {
        console.error('invalid number of entries');
        return;
    }
    const canvasParent = entries[0].contentRect;

    // TODO: uncomment
    // const oldDims = settings.getVirtualDimensions();
    canvas.setWidth(canvasParent.width);
    canvas.setHeight(canvasParent.height);
    // const newDims = settings.getVirtualDimensions();

    // // scale image to fit new canvas size
    // if (image.image) {
    //     const oldInchesFromLeft = (image.image.left! - oldDims.posterLeft) * oldDims.inchesPerPixel;
    //     const oldInchesFromTop = (image.image.top! - oldDims.posterTop) * oldDims.inchesPerPixel;

    //     eventHub.triggerEvent('imageScaled'); // scale image to canvas

    //     const newLeft = (oldInchesFromLeft / newDims.inchesPerPixel) + newDims.posterLeft;
    //     const newTop = (oldInchesFromTop / newDims.inchesPerPixel) + newDims.posterTop;
    //     image.moveImageTo({
    //         left: newLeft,
    //         top: newTop,
    //     });
    // }

    poster.overlay.drawOverlay();
    // border.drawBorder();
    canvas.renderAll();
}

export default Canvas;