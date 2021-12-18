import { useState, useEffect, FormEvent } from 'react';
import poster from '../class/poster';
import eventHub from '../class/posterEventHub';

function BorderColor() {
    const [borderColor, setBorderColor] = useState('#ffffff');

    useEffect(() => {
        eventHub.subscribe('colorChanged', () => {
            setBorderColor(poster.settings.borderColor);
        });
    })

    // color
    function onBorderColorInput(e: FormEvent<HTMLInputElement>) {
        const color = e.currentTarget.value;
        poster.settings.borderColor = color;
        poster.canvas?.setBackgroundColor(color, () => undefined);
        poster.canvas?.renderAll();
        eventHub.triggerEvent('colorChanged');
    }

    return (
        <div className="">
            <label className="text-sm" htmlFor="border-color">Border Color </label>
            <div className="">
                <input type="color" className="shadow-md border-1 w-12 h-12" value={borderColor} onInput={onBorderColorInput}></input>
            </div>
        </div>
    );
}

export default BorderColor;