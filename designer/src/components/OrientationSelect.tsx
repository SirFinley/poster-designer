import { observer } from 'mobx-react-lite';
import { ChangeEvent } from 'react';
import { OrientationOptions } from '../class/settings';
import { usePoster} from '../util/hooks';
import Select from "./Select";
import { postMessage } from '../util';

const OrientationSelect = observer(() => {
    const poster = usePoster();

    function onOrientationInput(e: ChangeEvent<HTMLSelectElement>) {
        const orientation = e.currentTarget.value as OrientationOptions;
        poster.settings.orientation = orientation;
        
        const capitalized = orientation.charAt(0).toUpperCase() + orientation.slice(1)
        postMessage({
            type: 'poster.selectOption',
            data: {
                option: {
                    name: 'Orientation',
                    value: capitalized,
                }
            }
        });
    }

    return (
        <Select value={poster.settings.orientation} onChange={onOrientationInput} label="Orientation">
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
        </Select>
    );
});

export default OrientationSelect;