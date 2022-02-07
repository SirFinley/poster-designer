import React, { ChangeEvent, useContext, useEffect, useRef } from "react";
import { fabric } from "fabric";
import DropArea from "./DropArea";
import { observer } from "mobx-react-lite";
import { poster, PosterContext } from "../util/Context";
import Poster from "../class/poster";
import "./Canvas.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

const Canvas = observer(() => {
  const poster = useContext(PosterContext);
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const designCanvasId = "design-canvas";
  const previewCanvasId = "preview-canvas";

  useEffect(() => {
    const designCanvas = initDesignCanvas();
    const previewCanvas = initPreviewCanvas();

    const canvasResizeObserver = new ResizeObserver((entries) =>
      resizeCanvases(poster, designCanvas, previewCanvas, entries)
    );
    canvasResizeObserver.observe(canvasWrapper.current!);
    poster.setCanvas(designCanvas);
    poster.setPreviewCanvas(previewCanvas);
  }, [canvasWrapper, poster]);

  const initDesignCanvas = () => {
    const canvas = new fabric.Canvas(designCanvasId, {
      width: 400,
      height: 400,
    });

    // enforce uniform scaling
    canvas.uniformScaling = true;
    canvas.uniScaleKey = "";

    return canvas;
  };

  const initPreviewCanvas = () => {
    const canvas = new fabric.Canvas(previewCanvasId, {
      width: 400,
      height: 400,
    });

    // enforce uniform scaling
    canvas.uniformScaling = true;
    canvas.uniScaleKey = "";

    return canvas;
  };

  function onDrop(files: FileList) {
    poster.image.uploadFile(files);
  }

  function toggleMode() {
    if (poster.designMode === "design") {
      poster.designMode = "preview";
      poster.previewCanvas.drawCanvas();
    } else if (poster.designMode === "preview") {
      poster.designMode = "design";
    }
  }

  function onFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) {
      onDrop(files);
    }
  }

  return (
    <div ref={canvasWrapper} className="canvas-wrapper relative overflow-hidden">
      <DropArea onDrop={onDrop} unstyled>
        {!poster.hasImage ? (
          <label className="absolute z-10 w-full h-full flex items-center justify-center">
            <Square width="55%" maxWidth="28rem">
              <div className="bg-gray-100 rounded-full p-5 shadow-slate-300 shadow-md text-center w-full h-full flex flex-col items-center justify-center">
                <FontAwesomeIcon
                  icon={faUpload}
                  className="text-blue-500 fa-5x mt-1 md:[font-size:8rem]"
                ></FontAwesomeIcon>
                <span className="md:text-xl mt-4 self-center">
                  Choose and upload your image here
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileSelect}
                ></input>
              </div>
            </Square>
          </label>
        ) : null}

        <div hidden={poster.designMode !== "design"}>
          <canvas id={designCanvasId} />
        </div>

        <div hidden={poster.designMode !== "preview"}>
          <canvas id={previewCanvasId} />
        </div>
      </DropArea>
      <div>
        <button
          onClick={toggleMode}
          className="absolute right-3 top-3 p-2 rounded-lg shadow-md shadow-gray-600 text-white bg-green-500 hover:bg-green-600 transition font-bold"
          hidden={!poster.hasImage}
        >
          {poster.designMode === "design" ? "Preview" : "Design"}
        </button>
      </div>
    </div>
  );
});

function Square(props: ISquareProps) {
  const outerStyles = {
    width: props.width,
    paddingBottom: `min(${props.maxWidth}, ${props.width}`,
    maxWidth: props.maxWidth,
  };
  return (
    <div className="relative" style={outerStyles}>
      <div className="absolute w-full h-full">{props.children}</div>
    </div>
  );
}

interface ISquareProps {
  width: string;
  maxWidth: string;
  children: React.ReactNode;
}

function resizeCanvases(
  poster: Poster,
  designCanvas: fabric.Canvas,
  previewCanvas: fabric.Canvas,
  entries: ResizeObserverEntry[]
) {
  if (entries.length !== 1) {
    console.error("invalid number of entries");
    return;
  }

  const canvasParent = entries[0].contentRect;
  resizeDesignCanvas(poster, designCanvas, canvasParent);
  resizePreviewCanvas(previewCanvas, canvasParent);
}

function resizeDesignCanvas(
  poster: Poster,
  canvas: fabric.Canvas,
  canvasParent: DOMRectReadOnly
) {
  const settings = poster.settings;
  const image = poster.image;

  const oldDims = settings.getVirtualDimensions();
  canvas.setWidth(canvasParent.width);
  canvas.setHeight(canvasParent.height);
  const newDims = settings.getVirtualDimensions();

  // scale image to fit new canvas size
  if (image.image) {
    const oldInchesFromLeft =
      (image.image.left! - oldDims.posterLeft) * oldDims.inchesPerPixel;
    const oldInchesFromTop =
      (image.image.top! - oldDims.posterTop) * oldDims.inchesPerPixel;

    poster.image.onScaled();

    const newLeft = oldInchesFromLeft / newDims.inchesPerPixel + newDims.posterLeft;
    const newTop = oldInchesFromTop / newDims.inchesPerPixel + newDims.posterTop;
    image.moveImageTo({
      left: newLeft,
      top: newTop,
    });
  }

  poster.overlay.drawOverlay();
  poster.border.drawBorder();
  canvas.renderAll();
}

function resizePreviewCanvas(
  canvas: fabric.Canvas,
  canvasParent: DOMRectReadOnly
) {
  canvas.setWidth(canvasParent.width);
  canvas.setHeight(canvasParent.height);
  canvas.renderAll();
  poster.previewCanvas.resize();
}

export default Canvas;
