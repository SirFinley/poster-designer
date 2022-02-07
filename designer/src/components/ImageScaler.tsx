import { usePoster} from '../util/hooks';
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
      <label>
        Scale Image: <DpiText dpi={poster.image.dpi}></DpiText>
      </label>
      {/* TODO: display info tooltip if svg, info icon, text: "SVG images will be printed at 600 dpi" */}
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

  let color = "";
  if (dpi <= 30) {
    color = "text-red-500";
  } else if (dpi <= 100) {
    color = "text-yellow-500";
  } else {
    color = "text-green-500";
  }

  const dpiText = `${dpi.toFixed(0)} DPI`;
  return <span className={`font-semibold ${color}`}>{dpiText}</span>;
}

interface DpiTextProps {
  dpi: number | null;
}

export default ImageScaler;
