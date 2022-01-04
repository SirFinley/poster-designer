import React, { useContext } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { PosterContext } from '../util/Context';
import { observer } from 'mobx-react-lite';

const ImageScaler = observer(() => {
    const poster = useContext(PosterContext);

    function onScaleImage(value: number) {
        poster.image.imagePosterRatio = fromSliderScaleValue(value);
    }

    function fromSliderScaleValue(imageScale: number): number {
        return Math.pow(2, imageScale) - 1;
    }

    function toSliderScaleValue(imageScale: number): number {
        return Math.log2(imageScale + 1);
    }

    return (
        <div className="w-full">
            <label className="text-sm" htmlFor="image-scale">Scale Image <DpiText dpi={poster.image.dpi}></DpiText></label>
            <div className="mx-2">
                <Slider min={0.05} max={3} value={toSliderScaleValue(poster.image.imagePosterRatio)} step={0.001} onChange={onScaleImage} />
            </div>
        </div>
    );
});

function DpiText({dpi} : DpiTextProps) {
    if (!dpi) {
        return null;
    }

    let color = '';
    if (dpi <= 30) {
        color = 'text-red-500';
    }
    else if (dpi <= 100) {
        color = 'text-yellow-500';
    }
    else {
        color = 'text-green-500';
    }
    
    const dpiText = ` - ${dpi.toFixed(0)} DPI`;
    return <span className={`font-semibold ${color}`}>{dpiText}</span>;
}

interface DpiTextProps {
    dpi: number|null
}

export default ImageScaler;