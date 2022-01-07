import { observer } from 'mobx-react-lite';
import { FormEvent, useContext } from 'react';
import { PosterContext } from '../util/Context';

const BorderColor = observer(() => {
    const poster = useContext(PosterContext);

    function onBorderColorInput(e: FormEvent<HTMLInputElement>) {
        const color = e.currentTarget.value;
        poster.settings.borderColor = color;
        poster.canvas?.setBackgroundColor(color, () => undefined);
        poster.canvas?.renderAll();
    }

    return (
        <div>
            <label className="text-sm" htmlFor="border-color">Border Color</label>
            <div>
                <input type="color" className="shadow-md border-1 w-12 h-12" value={poster.settings.borderColor} onInput={onBorderColorInput}></input>
            </div>
        </div>
    );
});

export default BorderColor;