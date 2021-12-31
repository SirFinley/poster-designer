import React, { useEffect, useState } from 'react';
import { API as NoUiAPI } from 'nouislider';
import poster from '../class/poster';
import eventHub from '../class/posterEventHub';
import NoUiSlider from './Slider';
import NoUiSliderClass from '../class/noUiSlider';

function ImageScaler() {
    const [dpi, setDpi] = useState<number|null>(null);

    useEffect(() => {
        const onDpiChanged = eventHub.subscribe('dpiChanged', () => setDpi(poster.image.getDpi()));

        return () => {
            onDpiChanged.unsubscribe();
        }
    });

    function onScaleSetup(slider: NoUiSliderClass) {
        slider.slider.updateOptions({
            range: {
                min: 0,
                max: 3,
            },
            start: 1,
            step: 0.001,
        }, false);
        poster.settings.imageScaleInput = slider;

        slider.slider.on('slide', onScaleImage);
        function onScaleImage(this: NoUiAPI) {
            const value = fromSliderScaleValue(this.get() as string);
            poster.settings.setImageScale(value);
            eventHub.triggerEvent('imageScaled');
        }
    }

    function fromSliderScaleValue(sliderValue: string): number {
        let value = parseFloat(sliderValue) || 1;
        value = Math.pow(2, value) - 1;
        return value;
    }

    return (
        <div className="w-full">
            <label className="text-sm" htmlFor="image-scale">Scale Image <DpiText dpi={dpi}></DpiText></label>
            <div className="mx-2">
                <NoUiSlider setup={onScaleSetup}></NoUiSlider>
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