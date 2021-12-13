import { useEffect, useRef } from 'react';
import NoUiSliderClass from '../class/noUiSlider';

function NoUiSlider({ setup }: IProps) {
    const sliderRef = useRef(null);

    useEffect(() => {
        const slider = new NoUiSliderClass(sliderRef.current!, 0, 3, 1, 0.001);
        setup(slider);
    }, [sliderRef])
    
    return (
        <div ref={sliderRef} className="noUiSlider slider-round"></div>
        
        // TODO: style for borders sliders
        // border sliders
        // <div ref={sliderRef} className="noUiSlider slider-round mx-3"></div>
    )
}

interface IProps {
    setup: (slider: NoUiSliderClass) => void,
}

export default NoUiSlider;