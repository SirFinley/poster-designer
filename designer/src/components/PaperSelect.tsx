import { observer } from "mobx-react-lite";
import { ChangeEvent } from "react";
import {
  PaperOptions,
  paperOptionsDisplayMap,
  paperSettingToShopify,
} from "../class/settings";
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
      <PaperOption paper="glossy" />
      <PaperOption paper="matte" />
      {poster.shopify ? <PaperOption paper="metallic" /> : null}
    </Select>
  );
});

function PaperOption({ paper }: IPaperOptionProps) {
  const poster = usePoster();
  const outOfStock = poster.settings.isOutOfStock(paper);
  const name = paperOptionsDisplayMap.get(paper);

  return (
    <option key={paper} value={paper} disabled={outOfStock}>
      {name} {outOfStock ? "(Out of Stock)" : null}
    </option>
  );
}

interface IPaperOptionProps {
  paper: PaperOptions;
}

export default PaperSelect;
