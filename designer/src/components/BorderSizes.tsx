import { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import poster from '../class/poster';
import eventHub from '../class/posterEventHub';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink, faUnlink } from '@fortawesome/free-solid-svg-icons'
import { STEP_SIZE } from '../class/border';

function BorderSizes() {
    const [linked, setLinked] = useState(true);
    const [sideBorder, setSideBorder] = useState(0);
    const [maxSide, setMaxSide] = useState(10);
    const [verticalBorder, setVerticalBorder] = useState(0);
    const [maxVertical, setMaxVertical] = useState(10);

    useEffect(() => {
        const onBorderSettingChanged = eventHub.subscribe('borderSettingChanged', refreshBorderValues);
        const onSizeChanged = eventHub.subscribe('sizeSettingChanged', refreshBorderValues);
        const onOrientationChanged = eventHub.subscribe('orientationSettingChanged', refreshBorderValues);

        poster.border.initialize();
        poster.border.drawBorder();

        return () => {
            onBorderSettingChanged.unsubscribe();
            onSizeChanged.unsubscribe();
            onOrientationChanged.unsubscribe();
        }
    });

    function refreshBorderValues() {
        const size = poster.settings.getRealPosterDimensions();
        const maxSideBorder = size.width / 2 - STEP_SIZE;
        const maxVerticalBorder = size.height / 2 - STEP_SIZE;
        poster.border.maxSide = maxSideBorder;
        poster.border.maxVertical = maxVerticalBorder;

        setMaxSide(maxSideBorder);
        setSideBorder(poster.settings.sideBorder);

        setMaxVertical(maxVerticalBorder);
        setVerticalBorder(poster.settings.verticalBorder);
    }

    function onSideBorderChange(value: number) {
        poster.border.updateSideBorder(value);
    }

    function onVerticalBorderChange(value: number) {
        poster.border.updateVerticalBorder(value);
    }

    function toggleLink() {
        const newLinked = !linked;
        poster.border.bordersLinked = newLinked;
        setLinked(newLinked);
    }

    const linkButton = (
        <button className="btn-border-link mr-3" onClick={toggleLink}>
            <FontAwesomeIcon icon={linked ? faLink : faUnlink}></FontAwesomeIcon>
        </button>
    );

    const maxWidth = Math.max(maxVertical, maxSide);
    const verticalWidth = maxVertical / maxWidth * 100;
    const sideWidth = maxSide / maxWidth * 100;

    return (
        <div className="pt-2 flex flex-col flex-wrap place-content-between overflow-auto w-80">
            <div className="mb-2">
                <label className="text-sm" htmlFor="vertical-border">Top/Bottom Border: {poster.settings.verticalBorder}"</label>
                <div className="flex items-center">
                    {linkButton}
                    <div className="w-full pr-2">
                        <Slider min={0} max={maxVertical} value={verticalBorder} step={STEP_SIZE} onChange={onVerticalBorderChange} style={{ width: `${verticalWidth}%` }} />
                    </div>
                </div>
            </div>
            <div className="mb-0">
                <label className="text-sm" htmlFor="side-border">Side Border: {poster.settings.sideBorder}"</label>
                <div className="flex items-center">
                    {linkButton}
                    <div className="w-full pr-2">
                        <Slider min={0} max={maxSide} value={sideBorder} step={STEP_SIZE} onChange={onSideBorderChange} style={{ width: `${sideWidth}%` }} />
                    </div>
                </div>
            </div>
            {/* <!-- used to calculate width for border sliders --> */}
            <div className="h-0 overflow-hidden">
                <div className="flex">
                    {linkButton}
                    <div className="noUiSlider w-72 pr-4" ></div>
                </div>
            </div>
        </div>
    );
}

export default BorderSizes;