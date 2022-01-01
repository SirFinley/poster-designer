import { useState, ChangeEvent } from 'react';
import * as AllSettings from '../class/settings';
import poster from '../class/poster';
import eventHub from '../class/posterEventHub';
import { SizeOptions } from '../class/settings';
import Select from "./Select";

function SizeSelect() {
    const [size, setSize] = useState<SizeOptions>(poster.defaultSize);
    const onSizeInput = (e: ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.currentTarget.value as SizeOptions;
        setSize(newValue);

        poster.settings.size = newValue;
        eventHub.triggerEvent('sizeSettingChanged');
    }

    return (
        <Select value={size} onChange={onSizeInput} label="Size">
            {
                Object.keys(AllSettings.sizeOptionsDisplayMap).map((key) =>
                    <option key={key} value={key}>{AllSettings.sizeOptionsDisplayMap[key]}</option>
                )
            }
        </Select>
    );
}

export default SizeSelect;