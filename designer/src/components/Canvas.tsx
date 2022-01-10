import React, { useContext, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import DropArea from './DropArea';
import { observer } from 'mobx-react-lite';
import { PosterContext } from '../util/Context';
import Poster from '../class/poster';

const Canvas = observer(() => {
    const poster = useContext(PosterContext);
    const canvasWrapper = useRef<HTMLDivElement>(null);
    const designCanvasId = 'design-canvas';
    const previewCanvasId = 'preview-canvas';

    useEffect(() => {
        const designCanvas = initDesignCanvas();
        const previewCanvas = initPreviewCanvas();

        const canvasResizeObserver = new ResizeObserver((entries) => resizeCanvases(poster, designCanvas, previewCanvas, entries));
        canvasResizeObserver.observe(canvasWrapper.current!);
        poster.setCanvas(designCanvas);
        poster.setPreviewCanvas(previewCanvas);
    }, [canvasWrapper, poster])

    const initDesignCanvas = () => {
        const canvas = new fabric.Canvas(designCanvasId, {
            width: 400,
            height: 400,
        });

        // enforce uniform scaling
        canvas.uniformScaling = true;
        canvas.uniScaleKey = '';

        return canvas;
    }

    const initPreviewCanvas = () => {
        const canvas = new fabric.Canvas(previewCanvasId, {
            width: 400,
            height: 400,
        });

        // enforce uniform scaling
        canvas.uniformScaling = true;
        canvas.uniScaleKey = '';

        return canvas;
    }

    function onDrop(files: FileList) {
        poster.image.uploadFile(files);
    }

    function toggleMode() {
        if (poster.designMode === 'design') {
            poster.designMode = 'preview';
            poster.previewCanvas.drawCanvas();
        }
        else if (poster.designMode === 'preview') {
            poster.designMode = 'design';
        }
    }

    return (
        <div ref={canvasWrapper} style={{ minWidth: '200px' }} className="relative">
            <DropArea onDrop={onDrop} unstyled>

                <AbsoluteToggle show={poster.designMode === 'design'}>
                    <canvas id={designCanvasId} ></canvas>
                </AbsoluteToggle>

                <AbsoluteToggle show={poster.designMode === 'preview'}>
                    <canvas id={previewCanvasId} ></canvas>
                </AbsoluteToggle>
            </DropArea>
            <div>
                <button onClick={toggleMode}
                    className="absolute right-3 top-3 p-2 rounded-lg shadow-md shadow-gray-600 text-white bg-green-500 hover:bg-green-600 transition font-bold" >
                    {poster.designMode === 'design' ? 'Preview' : 'Design'}
                </button>
            </div>
        </div>
    );
});

function AbsoluteToggle(props: any) {
    return <div className={`${props.show ? '' : 'hidden'}`}>{props.children}</div>
}


function resizeCanvases(poster: Poster, designCanvas: fabric.Canvas, previewCanvas: fabric.Canvas, entries: ResizeObserverEntry[]) {
    if (entries.length !== 1) {
        console.error('invalid number of entries');
        return;
    }

    const canvasParent = entries[0].contentRect;
    resizeDesignCanvas(poster, designCanvas, canvasParent);
    resizePreviewCanvas(previewCanvas, canvasParent);
}

function resizeDesignCanvas(poster: Poster, canvas: fabric.Canvas, canvasParent: DOMRectReadOnly) {
    const settings = poster.settings;
    const image = poster.image;

    const oldDims = settings.getVirtualDimensions();
    canvas.setWidth(canvasParent.width);
    canvas.setHeight(canvasParent.height);
    const newDims = settings.getVirtualDimensions();

    // scale image to fit new canvas size
    if (image.image) {
        const oldInchesFromLeft = (image.image.left! - oldDims.posterLeft) * oldDims.inchesPerPixel;
        const oldInchesFromTop = (image.image.top! - oldDims.posterTop) * oldDims.inchesPerPixel;

        poster.image.onScaled();

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

function resizePreviewCanvas(canvas: fabric.Canvas, canvasParent: DOMRectReadOnly) {
    canvas.setWidth(canvasParent.width);
    canvas.setHeight(canvasParent.height);
    canvas.renderAll();
}

export default Canvas;