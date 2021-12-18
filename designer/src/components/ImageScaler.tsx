import React, { useState } from 'react';
import { API as NoUiAPI } from 'nouislider';
import poster from '../class/poster';
import eventHub from '../class/posterEventHub';
import NoUiSlider from './Slider';
import NoUiSliderClass from '../class/noUiSlider';

function ImageScaler() {
    const [dpi, setDpi] = useState<number>(0);

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
            setDpi(value * 100);
        }
    }

    function fromSliderScaleValue(sliderValue: string): number {
        let value = parseFloat(sliderValue) || 1;
        value = Math.pow(2, value) - 1;
        return value;
    }

    const dpiText = ` - ${dpi.toFixed(1)} DPI`;
    let dpiElem;
    if (dpi <= 30) {
        dpiElem = <span className="text-red-500">{dpiText}</span>
    }
    else if (dpi <= 100) {
        dpiElem = <span className="text-yellow-200">{dpiText}</span>
    }
    else {
        dpiElem = <span className="text-green-500">{dpiText}</span>
    }

    return (
        <div className="w-full">
            <label className="text-sm" htmlFor="image-scale">Scale Image {dpiElem}</label>
            <div className="mx-2">
                <NoUiSlider setup={onScaleSetup}></NoUiSlider>
            </div>
        </div>
    );
}

export default ImageScaler;