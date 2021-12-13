import { API as NoUiAPI } from 'nouislider';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import * as AllSettings from '../class/settings';
import poster from '../class/poster';
import { OrientationOptions, SizeOptions } from '../class/settings';
import eventHub from '../class/posterEventHub';
import NoUiSlider from './Slider';
import NoUiSliderClass from '../class/noUiSlider';

function Settings() {
    const [size, setSize] = useState<SizeOptions>(poster.defaultSize);
    const [borderColor, setBorderColor] = useState('#ffffff');

    useEffect(() => {
        eventHub.subscribe('colorChanged', () => {
            setBorderColor(poster.settings.borderColor);
        });
    })

    // size
    const onSizeInput = (e: ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.currentTarget.value as SizeOptions;
        setSize(newValue);

        poster.settings.size = newValue;
        eventHub.triggerEvent('sizeSettingChanged');
        console.log('size changed');
    }

    // orientation
    function onOrientationInput(e: ChangeEvent<HTMLSelectElement>) {
        const orientation = e.currentTarget.value as OrientationOptions;
        poster.settings.orientation = orientation;
        eventHub.triggerEvent('orientationSettingChanged');
    }

    function onFitToBorders() {
        poster.image.fitImageToBorders();
    }
    function onFillBorders() {
        poster.image.fillBorders();
    }
    function onFillCanvas() {
        poster.image.fillPoster();
    }
    function onCenter() {
        poster.image.centerImage();
    }
    function onCenterVertical() {
        poster.image.centerImageVertical();
    }
    function onCenterHorizontal() {
        poster.image.centerImageHorizontal();
    }

    // // drag and drop upload
    // let dropAreas = document.getElementsByClassName("drop-area") as HTMLCollectionOf<HTMLElement>;
    // for (const dropArea of dropAreas) {
    //     ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    //         dropArea.addEventListener(eventName, preventDefaults, false);
    //     })

    //     function preventDefaults(e: Event) {
    //         e.preventDefault()
    //         e.stopPropagation()
    //     }

    //     // TODO: handle drop area highlight
    //     ['dragenter', 'dragover'].forEach(eventName => {
    //         dropArea.addEventListener(eventName, highlight, false);
    //     });

    //     ['dragleave', 'drop'].forEach(eventName => {
    //         dropArea.addEventListener(eventName, unhighlight, false);
    //     })

    //     dropArea.addEventListener('drop', (e) => {
    //         let dt = e.dataTransfer!;
    //         let file = dt.files[-1];
    //         this.imageInput.files = dt.files;
    //         this.handleFile(file);
    //     });

    //     function highlight() {
    //         dropArea.classList.add('highlight')
    //     }

    //     function unhighlight() {
    //         dropArea.classList.remove('highlight')
    //     }

    //     this.imageInput.addEventListener('change', (e: Event) => {
    //         let target = e.target as HTMLInputElement;
    //         this.handleFile(target.files![-1]);
    //     });
    // }

    function onFileSelect(e: ChangeEvent<HTMLInputElement>) {
        const target = e.target;
        poster.image.handleFile(target.files![0]);
    }

    // color
    function onBorderColorInput(e: FormEvent<HTMLInputElement>) {
        const color = e.currentTarget.value;
        poster.settings.borderColor = color;
        poster.canvas?.setBackgroundColor(color, () => undefined);
        poster.canvas?.renderAll();
        eventHub.triggerEvent('colorChanged');
    }

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
        <div className="flex flex-col gap-2 max-w-sm">
            <h2 className="font-bold text-lg">Settings</h2>

            {/* <!-- size --> */}
            <div className="">
                <label className="text-sm" htmlFor="size-input">Size</label>
                <div className="h-12">
                    <select className="rounded-md shadow-md w-full pl-3 h-full border-2 border-gray-50" value={size} onChange={onSizeInput}>
                        {
                            Object.keys(AllSettings.sizeOptionsDisplayMap).map((key) => {
                                return <option key={key} value={key}>{AllSettings.sizeOptionsDisplayMap[key]}</option>
                            })
                        }
                    </select>
                </div>
            </div>

            {/* <!-- orientation --> */}
            <div className="">
                <label className="text-sm" htmlFor="orientation-input">Orientation</label>
                <div className="h-12">
                    <select className="rounded-md shadow-md w-full pl-3 h-full border-2 border-gray-50"
                        onChange={onOrientationInput}>
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                    </select>
                </div>
            </div>

            {/* <!-- borders --> */}
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
                <div className="">
                    <label id="side-border-value" className="text-sm" htmlFor="border-color">Border Color </label>
                    <div className="">
                        <input type="color" id="border-color" className="shadow-md border-1 w-12 h-12" value={borderColor} onInput={onBorderColorInput}></input>
                    </div>
                </div>
            </div>

            {/* <!-- image scale --> */}
            <div className="w-full">
                <label id="image-scale-value" className="text-sm" htmlFor="image-scale">Scale Image</label>
                <div className="mx-2">
                    <NoUiSlider setup={onScaleSetup}></NoUiSlider>
                </div>
            </div>

            {/* <!-- fit/fill/center image --> */}
            <div className="flex flex-col gap-y-1">
                <button className="p-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition font-bold" onClick={onFitToBorders}>Fit To Borders</button>
                <button className="p-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition font-bold" onClick={onFillBorders}>Fill Borders</button>
                <button className="p-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition font-bold" onClick={onFillCanvas}>Fill Canvas</button>
                <div className="flex gap-1">
                    <button className="w-40 p-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition font-bold" onClick={onCenter}>Center</button>
                    <button className="w-40 p-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition font-bold" onClick={onCenterVertical}>Center Vertically</button>
                    <button className="w-40 p-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition font-bold" onClick={onCenterHorizontal}>Center Horizontally</button>
                </div>
            </div>

            {/* <!-- image --> */}
            <div id="" className="drop-area p-3">
                <form className="m-0">
                    <label htmlFor="photo-input">Drag and drop your poster image here or in the editor</label>
                    <input id="photo-input" type="file" accept="image/*"
                        className="block w-full cursor-pointer bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-transparent text-sm rounded-lg"
                        aria-describedby="user_avatar_help"
                        onChange={onFileSelect}></input>
                    <div id="img-upload-card" className="flex hidden p-2">
                        <img src="#" id="img-preview" alt="" className="w-20 h-20 object-scale-down hidden" ></img>
                        <div id="img-preview-spinner" className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-gray-900" ></div>
                        </div>
                        <div className="p-4 pr-0 w-full">
                            <div className="mb-1 flex justify-between">
                                <span id="img-progress-label-status" className="text-base font-medium">Uploading...</span>
                                <span id="img-progress-label-percent" className="text-sm font-medium">0%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div id="img-progress" className="bg-gray-600 h-4 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* <!-- clear and save buttons --> */}
            <div className="flex justify-items-end justify-around">
                <button id="clear-button" className="w-40 p-2 rounded text-white bg-red-500 hover:bg-red-600 transition font-bold">Clear Poster</button>
                <button id="save-button" className="w-40 p-2 rounded text-white bg-green-500 hover:bg-green-600 transition font-bold
                     disabled:opacity-30 disabled:hover:bg-green-500 disabled:cursor-not-allowed" disabled>Save Poster</button>
            </div>
        </div>
    );
}

export default Settings;