import React, { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import poster from '../class/poster';
import eventHub from '../class/posterEventHub';

function ImageScaler() {
    const [sliderValue, setSliderValue] = useState(1);
    const [dpi, setDpi] = useState<number|null>(null);

    useEffect(() => {
        const onDpiChanged = eventHub.subscribe('dpiChanged', () => setDpi(poster.image.getDpi()));
        const onSliderChanged = eventHub.subscribe('dpiChanged', () => {
            setSliderValue(toSliderScaleValue(poster.settings.imageScaleValue));
        });

        return () => {
            onDpiChanged.unsubscribe();
            onSliderChanged.unsubscribe();
        }
    });


    function onScaleImage(value: number) {
        value = fromSliderScaleValue(value);
        poster.settings.setImageScale(value);
        eventHub.triggerEvent('imageScaled');
    }

    function fromSliderScaleValue(imageScale: number): number {
        return Math.pow(2, imageScale) - 1;
    }

    function toSliderScaleValue(imageScale: number): number {
        return Math.log2(imageScale + 1);
    }

    return (
        <div className="w-full">
            <label className="text-sm" htmlFor="image-scale">Scale Image <DpiText dpi={dpi}></DpiText></label>
            <div className="mx-2">
                <Slider min={0.05} max={3} value={sliderValue} step={0.001} onChange={onScaleImage} />
            </div>
        </div>
    );
}

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