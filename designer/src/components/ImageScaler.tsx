import { usePoster } from "../util/hooks";
import { observer } from "mobx-react-lite";
import Slider from "./Slider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

const ImageScaler = observer(() => {
  const poster = usePoster();

  function onScaleImage(value: number) {
    poster.image.imagePosterRatio = fromSliderScaleValue(value);
  }

  function fromSliderScaleValue(imageScale: number): number {
    return Math.pow(2, imageScale) - 1;
  }

  const SCALE_STEP = 0.001;
  const BUTTON_STEP = SCALE_STEP * 10;
  const SCALE_MIN = 0.1;
  const SCALE_MAX = 2.5;

  function toSliderScaleValue(imageScale: number): number {
    return Math.log2(imageScale + 1);
  }

  function constrainSliderValue(value: number): number {
    return Math.max(SCALE_MIN, Math.min(SCALE_MAX, value));
  }

  function addToScale(amount: number) {
    const sliderValue = toSliderScaleValue(poster.image.imagePosterRatio);
    const constrainedValue = constrainSliderValue(sliderValue + amount);
    onScaleImage(constrainedValue);
  }

  return (
    <div className="w-full">
      <div>Scale Image</div>
      <div className="text-center">
        Print Quality: <DpiText dpi={poster.image.dpi}></DpiText>
      {/* TODO: display info tooltip if svg, info icon, text: "SVG images will be printed at 600 dpi" */}
      </div>
      <div className="flex flex-row items-center gap-2 text-lg">
        <button className="p-2" onClick={() => addToScale(-BUTTON_STEP)}>
          <FontAwesomeIcon icon={faMinus}></FontAwesomeIcon>
        </button>
        <Slider
          min={SCALE_MIN}
          max={SCALE_MAX}
          value={toSliderScaleValue(poster.image.imagePosterRatio)}
          step={SCALE_STEP}
          onChange={onScaleImage}
        />
        <button className="p-2" onClick={() => addToScale(BUTTON_STEP)}>
          <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
        </button>
      </div>
    </div>
  );
});

function DpiText({ dpi }: DpiTextProps) {
  if (!dpi) {
    return null;
  }

  let quality = "";
  let color = "";
  if (dpi <= 80) {
    color = "text-red-500";
    quality = "Poor";
  } else if (dpi <= 150) {
    color = "text-yellow-500";
    quality = "Average";
  } else if (dpi <= 300) {
    color = "text-green-500";
    quality = "Good";
  } else if (dpi <= 600) {
    color = "text-green-500";
    quality = "Great";
  } else {
    color = "text-green-500";
    quality = "Fantastic";
  }

  const boundedDpi = Math.min(dpi, 1200);
  const dpiText = `${boundedDpi.toFixed(0)} DPI`;
  return <span className={`font-semibold ${color}`}>{quality} - {dpiText}</span>;
}

interface DpiTextProps {
  dpi: number | null;
}

export default ImageScaler;
