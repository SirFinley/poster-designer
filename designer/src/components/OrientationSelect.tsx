import { observer } from 'mobx-react-lite';
import { ChangeEvent, useContext } from 'react';
import { OrientationOptions } from '../class/settings';
import { PosterContext } from '../util/Context';
import Select from "./Select";

const OrientationSelect = observer(() => {
    const poster = useContext(PosterContext);

    function onOrientationInput(e: ChangeEvent<HTMLSelectElement>) {
        const orientation = e.currentTarget.value as OrientationOptions;
        poster.settings.orientation = orientation;
    }

    return (
        <Select value={poster.settings.orientation} onChange={onOrientationInput} label="Orientation">
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
        </Select>
    );
});

export default OrientationSelect;