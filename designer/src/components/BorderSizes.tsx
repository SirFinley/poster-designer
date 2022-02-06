import { useContext } from "react";
import { STEP_SIZE } from "../class/border";
import { observer } from "mobx-react-lite";
import { PosterContext } from "../util/Context";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Slider.css";

const BorderSizes = observer(() => {
  const poster = useContext(PosterContext);
  const settings = poster.settings;
  const border = poster.border;

  function onBorderChange(value: number) {
    poster.border.updateBorder(value);
  }

  function addToBorder(amount: number) {
    border.updateBorder(settings.border + amount);
  }

  return (
    <div>
      <label className="block">Border Size: (Inches)</label>
      <div className="flex w-full pr-2 items-center">
        <input
          className="w-full"
          type="range"
          min={0}
          max={border.maxBorder}
          value={settings.border}
          step={STEP_SIZE}
          onChange={(e) => onBorderChange(parseFloat(e.target.value))}
        />
        <div className="flex items-center border-2 rounded-md ml-2">
          <button className="p-2" onClick={() => addToBorder(-STEP_SIZE)}>
            <FontAwesomeIcon icon={faMinus}></FontAwesomeIcon>
          </button>
          <div className="w-12 text-center">{settings.border.toFixed(3)}</div>
          <button className="p-2" onClick={() => addToBorder(STEP_SIZE)}>
            <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
          </button>
        </div>
      </div>
    </div>
  );
});

export default BorderSizes;
