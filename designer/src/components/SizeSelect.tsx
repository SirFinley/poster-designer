import { ChangeEvent } from 'react';
import * as AllSettings from '../class/settings';
import { SizeOptions } from '../class/settings';
import Select from "./Select";
import { observer } from 'mobx-react-lite';
import { usePoster} from '../util/hooks';
import { postMessage } from '../util';

const SizeSelect = observer(() => {
    const poster = usePoster();
    
    const onSizeInput = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.currentTarget.value;
        poster.settings.size = value as SizeOptions;

        const sides = value.split('x');
        const size = `${sides[0]}"x${sides[1]}"`;
        postMessage({
            type: 'poster.selectOption',
            data: {
                option: {
                    name: 'Size',
                    value: size,
                }
            }
        });
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