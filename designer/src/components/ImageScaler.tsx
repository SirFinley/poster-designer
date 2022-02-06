import React, { useContext } from "react";
import { PosterContext } from "../util/Context";
import { observer } from "mobx-react-lite";
import Slider from "./Slider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

const ImageScaler = observer(() => {
  const poster = useContext(PosterContext);

  function onScaleImage(value: number) {
    poster.image.imagePosterRatio = fromSliderScaleValue(value);
  }

  function fromSliderScaleValue(imageScale: number): number {
    return Math.pow(2, imageScale) - 1;
  }

  function toSliderScaleValue(imageScale: number): number {
    return Math.log2(imageScale + 1);
  }

  function addToScale(amount: number) {
    const sliderValue = toSliderScaleValue(poster.image.imagePosterRatio);
    onScaleImage(sliderValue + amount);
  }

  const SCALE_STEP = 0.001;
  const BUTTON_STEP = SCALE_STEP * 10;

  return (
    <div className="w-full">
      <label className="" htmlFor="image-scale">
        Scale Image <DpiText dpi={poster.image.dpi}></DpiText>
      </label>{" "}
      {/* TODO: display info tooltip if svg, info icon, text: "SVG images will be printed at 600 dpi" */}
      <div className="flex flex-row items-center">
        <div className="w-full">
          <Slider
            min={0.1}
            max={3}
            value={toSliderScaleValue(poster.image.imagePosterRatio)}
            step={SCALE_STEP}
            onChange={onScaleImage}
          />
        </div>
        <div className="flex items-center gap-2 ml-2 text-lg">
          <button className="p-2 border-2 rounded-md" onClick={() => addToScale(-BUTTON_STEP)}>
            <FontAwesomeIcon icon={faMinus}></FontAwesomeIcon>
          </button>
          <button className="p-2 border-2 rounded-md" onClick={() => addToScale(BUTTON_STEP)}>
            <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
          </button>
        </div>
      </div>
    </div>
  );
});

function DpiText({ dpi }: DpiTextProps) {
  if (!dpi) {
    return null;
  }

  let color = "";
  if (dpi <= 30) {
    color = "text-red-500";
  } else if (dpi <= 100) {
    color = "text-yellow-500";
  } else {
    color = "text-green-500";
  }

  const dpiText = ` - ${dpi.toFixed(0)} DPI`;
  return <span className={`font-semibold ${color}`}>{dpiText}</span>;
}

interface DpiTextProps {
  dpi: number | null;
}

export default ImageScaler;
