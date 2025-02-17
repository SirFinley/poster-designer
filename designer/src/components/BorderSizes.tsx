import { STEP_SIZE } from "../class/border";
import { observer } from "mobx-react-lite";
import { usePoster} from '../util/hooks';
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Slider from './Slider';

const BorderSizes = observer(() => {
  const poster = usePoster();
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
      <label>Border Size</label>
      <div className="flex w-full items-center">
        <Slider
          min={0}
          max={border.maxBorder}
          value={settings.border}
          step={STEP_SIZE}
          onChange={onBorderChange}
          disabled={!poster.hasImage}
        />
        <div className="flex items-center border-2 rounded-md border-zinc-600 ml-2 text-lg">
          <button className="p-2" onClick={() => addToBorder(-STEP_SIZE)}>
            <FontAwesomeIcon icon={faMinus}></FontAwesomeIcon>
          </button>
          <div className="w-12 text-center text-base">{settings.border.toFixed(3) + '"'}</div>
          <button className="p-2" onClick={() => addToBorder(STEP_SIZE)}>
            <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
          </button>
        </div>
      </div>
    </div>
  );
});

export default BorderSizes;
