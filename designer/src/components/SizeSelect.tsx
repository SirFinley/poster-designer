import { ChangeEvent, useContext } from 'react';
import * as AllSettings from '../class/settings';
import { SizeOptions } from '../class/settings';
import Select from "./Select";
import { observer } from 'mobx-react-lite';
import { PosterContext } from '../util/Context';

const SizeSelect = observer(() => {
    const poster = useContext(PosterContext);
    
    const onSizeInput = (e: ChangeEvent<HTMLSelectElement>) => {
        poster.settings.size = e.currentTarget.value as SizeOptions;
    }

    return (
        <Select value={poster.settings.size} onChange={onSizeInput} label="Size">
            {
                Array.from(AllSettings.sizeOptionsDisplayMap).map(([key, value]) =>
                    <option key={key} value={key}>{value}</option>
                )
            }
        </Select>
    );
});

export default SizeSelect;