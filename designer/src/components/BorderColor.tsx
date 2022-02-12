import { observer } from 'mobx-react-lite';
import { FormEvent } from 'react';
import { usePoster} from '../util/hooks';

const BorderColor = observer(() => {
    const poster = usePoster();

    function onBorderColorInput(e: FormEvent<HTMLInputElement>) {
        const color = e.currentTarget.value;
        poster.settings.setBorderColor(color);
    }

    return (
        <div>
            <label>Border Color</label>
            <div>
                <input type="color" className="shadow-md border-1 w-12 h-12" value={poster.settings.borderColor} onInput={onBorderColorInput}></input>
            </div>
        </div>
    );
});

export default BorderColor;