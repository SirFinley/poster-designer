import { observer } from "mobx-react-lite";
import { ChangeEvent } from "react";
import { PaperOptions, paperOptionsDisplayMap, paperSettingToShopify } from "../class/settings";
import { usePoster } from "../util/hooks";
import Select from "./Select";
import { postMessage } from "../util";

const PaperSelect = observer(() => {
  const poster = usePoster();

  function onPaperInput(e: ChangeEvent<HTMLSelectElement>) {
    const paper = e.currentTarget.value as PaperOptions;
    poster.settings.paper = paper;

    const shopifySetting = paperSettingToShopify.get(paper);
    postMessage({
      type: "poster.selectOption",
      data: {
        option: {
          name: "Paper",
          value: shopifySetting,
        },
      },
    });
  }

  return (
    <Select value={poster.settings.paper} onChange={onPaperInput} label="Paper">
      {Array.from(paperOptionsDisplayMap).map(([key, value]) => (
        <option key={key} value={key}>
          {value}
        </option>
      ))}
    </Select>
  );
});

export default PaperSelect;
