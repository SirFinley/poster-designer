import { API as NoUiAPI } from 'nouislider';
import poster from '../class/poster';
import eventHub from '../class/posterEventHub';
import NoUiSlider from './Slider';
import NoUiSliderClass from '../class/noUiSlider';

function BorderSizes() {

    // TODO: update only one border
    function onBorderSliderSetup(slider: NoUiSliderClass) {
        slider.slider.updateOptions({
            range: {
                min: 0,
                max: 20,
            },
            start: 0,
            step: 0.125,
        }, false);
        poster.settings.imageScaleInput = slider;

        slider.slider.on('slide', onScaleImage);
        function onScaleImage(this: NoUiAPI) {
            let value = fromSliderScaleValue(this.get() as string);
            // TODO: update only one border
            poster.settings.sideBorder = value;
            poster.settings.verticalBorder = value;
            eventHub.triggerEvent('borderSettingChanged');
        }
    }

    function fromSliderScaleValue(sliderValue: string): number {
        let value = parseFloat(sliderValue) || 1;
        value = Math.pow(2, value) - 1;
        return value;
    }

    return (
        <div className="pt-2 flex flex-col flex-wrap place-content-between overflow-auto">
            <div className="mb-2">
                <label id="vertical-border-value" className="text-sm" htmlFor="vertical-border">Top/Bottom Border: 0"</label>
                <div className="flex">
                    <button className="btn-border-link"> <i className="border-link fas fa-link"></i> </button>
                    {/* <div id="vertical-border" className="noUiSlider slider-round mx-3"></div> */}
                    <NoUiSlider setup={onBorderSliderSetup}></NoUiSlider>
                </div>
            </div>
            <div className="mb-2">
                <label id="side-border-value" className="text-sm" htmlFor="side-border">Side Border: 0"</label>
                <div className="flex ">
                    <button className="btn-border-link"> <i className="border-link fas fa-link"></i> </button>
                    {/* <div id="side-border" className="noUiSlider slider-round mx-3"></div> */}
                    <NoUiSlider setup={onBorderSliderSetup}></NoUiSlider>
                </div>
            </div>
            <div className="">
                {/* <!-- used to calculate width for border sliders --> */}
                <div className="flex">
                    <button hidden> <i className="border-link fas fa-link"></i> </button>
                    <div id="hidden-border" className="noUiSlider mx-3 w-80" ></div>
                </div>
            </div>
            {/* <div className="">
                <label id="side-border-value" className="text-sm" htmlFor="border-color">Border Color </label>
                <div className="">
                    <input type="color" id="border-color" className="shadow-md border-1 w-12 h-12" value={borderColor} onInput={onBorderColorInput}></input>
                </div>
            </div> */}
        </div>
    );
}

export default BorderSizes;