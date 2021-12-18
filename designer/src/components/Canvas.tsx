import React, { useEffect, useRef } from 'react';
import poster from '../class/poster';
import eventHub from '../class/posterEventHub';
import { fabric } from 'fabric';
import DropArea from './DropArea';

function Canvas() {
    const canvasWrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = initCanvas();

        const canvasResizeObserver = new ResizeObserver((entries) => resizeCanvas(canvas, entries));
        canvasResizeObserver.observe(canvasWrapper.current!);
        poster.setCanvas(canvas);
    }, [canvasWrapper])

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

    function onDrop(files: FileList) {
        poster.image.uploadFile(files[0]);
    }

    return (
        <div ref={canvasWrapper} className="flex-grow flex-1 self-stretch" style={{ minWidth: '200px' }}>
            <DropArea unstyled onDrop={onDrop}>
                <canvas id="fabric-canvas">
                </canvas>
            </DropArea>
        </div>
    );
}

function resizeCanvas(canvas: fabric.Canvas, entries: ResizeObserverEntry[]) {
    if (entries.length !== 1) {
        console.error('invalid number of entries');
        return;
    }
    const canvasParent = entries[0].contentRect;
    const settings = poster.settings;
    const image = poster.image;

    // TODO: uncomment
    const oldDims = settings.getVirtualDimensions();
    canvas.setWidth(canvasParent.width);
    canvas.setHeight(canvasParent.height);
    const newDims = settings.getVirtualDimensions();

    // scale image to fit new canvas size
    if (image.image) {
        const oldInchesFromLeft = (image.image.left! - oldDims.posterLeft) * oldDims.inchesPerPixel;
        const oldInchesFromTop = (image.image.top! - oldDims.posterTop) * oldDims.inchesPerPixel;

        eventHub.triggerEvent('imageScaled'); // scale image to canvas

        const newLeft = (oldInchesFromLeft / newDims.inchesPerPixel) + newDims.posterLeft;
        const newTop = (oldInchesFromTop / newDims.inchesPerPixel) + newDims.posterTop;
        image.moveImageTo({
            left: newLeft,
            top: newTop,
        });
    }

    poster.overlay.drawOverlay();
    poster.border.drawBorder();
    canvas.renderAll();
}

export default Canvas;