import { useEffect, useRef, useState } from 'react';
import poster from '../class/poster';
import eventHub from '../class/posterEventHub';
import NoUiSlider from './Slider';
import NoUiSliderClass from '../class/noUiSlider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink, faUnlink } from '@fortawesome/free-solid-svg-icons'

function BorderSizes() {
    const fullSlider = useRef(null);
    const [linked, setLinked] = useState(true);
    const [, setSideBorder] = useState(0);
    const [, setVerticalBorder] = useState(0);

    useEffect(() => {
        eventHub.subscribe('borderSettingChanged', () => {
            setSideBorder(poster.settings.sideBorder);
            setVerticalBorder(poster.settings.verticalBorder);
        })
        
        poster.border.fullSlider = fullSlider.current!;
        poster.border.initialize();
        poster.border.drawBorder();
    }, [fullSlider])

    function onSideBorderSliderSetup(slider: NoUiSliderClass) {
        slider.slider.updateOptions({
            range: {
                min: 0,
                max: 10,
            },
            start: 0,
            step: 0.125,
        }, false);
        poster.border.sideBorderInput = slider;

        slider.slider.on('slide', () => {
            poster.border.onSideBorderSlide();
        });
    }

    function onVerticalBorderSliderSetup(slider: NoUiSliderClass) {
        slider.slider.updateOptions({
            range: {
                min: 0,
                max: 10,
            },
            start: 0,
            step: 0.125,
        }, false);
        poster.border.verticalBorderInput = slider;

        slider.slider.on('slide', () => {
            poster.border.onVerticalBorderSlide();
        });
    }

    function toggleLink() {
        const newLinked = !linked;
        poster.border.bordersLinked = newLinked;
        setLinked(newLinked);
        console.log('link toggle');
    }

    const linkButton = (
        <button className="btn-border-link mr-3" onClick={toggleLink}>
            <FontAwesomeIcon icon={linked ? faLink : faUnlink}></FontAwesomeIcon>
        </button>
    );

    return (
        <div className="pt-2 flex flex-col flex-wrap place-content-between overflow-auto">
            <div className="mb-2">
                <label id="vertical-border-value" className="text-sm" htmlFor="vertical-border">Top/Bottom Border: {poster.settings.verticalBorder}"</label>
                <div className="flex">
                    {linkButton}
                    <NoUiSlider setup={onVerticalBorderSliderSetup}></NoUiSlider>
                </div>
            </div>
            <div className="mb-0">
                <label id="side-border-value" className="text-sm" htmlFor="side-border">Side Border: {poster.settings.sideBorder}"</label>
                <div className="flex">
                    {linkButton}
                    <NoUiSlider setup={onSideBorderSliderSetup}></NoUiSlider>
                </div>
            </div>
            <div className="h-0 overflow-hidden">
                {/* <!-- used to calculate width for border sliders --> */}
                <div className="flex">
                    {linkButton}
                    <div ref={fullSlider} className="noUiSlider w-80" ></div>
                </div>
            </div>
        </div>
    );
}

export default BorderSizes;