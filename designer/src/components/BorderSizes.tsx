import { useContext, useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink, faUnlink } from '@fortawesome/free-solid-svg-icons'
import { STEP_SIZE } from '../class/border';
import { observer } from 'mobx-react-lite';
import { PosterContext } from '../util/Context';

const BorderSizes = observer(() => {
    const [linked, setLinked] = useState(true);
    const poster = useContext(PosterContext);
    const settings = poster.settings;
    const border = poster.border;

    useEffect(() => {
        poster.border.initialize();
        poster.border.drawBorder();
    });

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

    const maxWidth = Math.max(border.maxVertical, border.maxSide);
    const verticalWidth = border.maxVertical / maxWidth * 100;
    const sideWidth = border.maxSide / maxWidth * 100;

    return (
        <div className="pt-2 flex flex-col flex-wrap place-content-between overflow-auto w-80">
            <div className="mb-2">
                <label className="text-sm" htmlFor="vertical-border">Top/Bottom Border: {poster.settings.verticalBorder}"</label>
                <div className="flex items-center">
                    {linkButton}
                    <div className="w-full pr-2">
                        <Slider min={0} max={border.maxVertical} value={settings.verticalBorder} step={STEP_SIZE} onChange={onVerticalBorderChange} style={{ width: `${verticalWidth}%` }} />
                    </div>
                </div>
            </div>
            <div className="mb-0">
                <label className="text-sm" htmlFor="side-border">Side Border: {poster.settings.sideBorder}"</label>
                <div className="flex items-center">
                    {linkButton}
                    <div className="w-full pr-2">
                        <Slider min={0} max={border.maxSide} value={settings.sideBorder} step={STEP_SIZE} onChange={onSideBorderChange} style={{ width: `${sideWidth}%` }} />
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
});

export default BorderSizes;