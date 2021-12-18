import { API as NoUiAPI } from 'nouislider';
import poster from '../class/poster';
import eventHub from '../class/posterEventHub';
import NoUiSlider from './Slider';
import NoUiSliderClass from '../class/noUiSlider';

function ImageScaler() {
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
            let value = fromSliderScaleValue(this.get() as string);
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
            <label className="text-sm" htmlFor="image-scale">Scale Image</label>
            <div className="mx-2">
                <NoUiSlider setup={onScaleSetup}></NoUiSlider>
            </div>
        </div>
    );
}

export default ImageScaler;