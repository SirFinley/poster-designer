import noUiSlider, { API as NoUiAPI } from 'nouislider';
import 'nouislider/dist/nouislider.css';

export default class NoUiSliderClass {
    constructor(element: HTMLElement, min: number, max: number, start: number, step: number) {
        this.slider = noUiSlider.create(element, {
            start: start,
            step: step,
            range: {
                'min': min,
                'max': max,
            },
            connect: 'lower',
            format: {
                to: function (value) {
                    return value.toFixed(3);
                },
                from: function (value) {
                    return parseFloat(value);
                }
            },
            animate: false,
        });
    }

    slider: NoUiAPI;

    get(): number {
        return this.slider.get() as number;
    }

    set(value: number) {
        this.slider.set(value);
    }

    getMax(): number {
        return this.slider.options.range.max.valueOf() as number;
    }

    getMin(): number {
        return this.slider.options.range.min.valueOf() as number;
    }

    setMax(value: number) {
        this.slider.updateOptions({
            range: {
                min: this.getMin(),
                max: value,
            },
        }, false);
    }

    setUiWidth(width: number) {
        this.slider.target.style.width = width + 'px';
    }
}