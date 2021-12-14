import { useState, ChangeEvent } from 'react';
import poster from '../class/poster';
import eventHub from '../class/posterEventHub';
import { OrientationOptions } from '../class/settings';
import Select from "./Select";

function OrientationSelect() {
    const [orientation, setOrientation] = useState<OrientationOptions>('portrait');

    function onOrientationInput(e: ChangeEvent<HTMLSelectElement>) {
        const orientation = e.currentTarget.value as OrientationOptions;
        setOrientation(orientation);

        poster.settings.orientation = orientation;
        eventHub.triggerEvent('orientationSettingChanged');
    }

    return (
        <Select value={orientation} onChange={onOrientationInput} label="Orientation">
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
        </Select>
    );
}

export default OrientationSelect;