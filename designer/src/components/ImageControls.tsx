import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { PosterContext } from '../util/Context';

const Settings = observer(() => {
    const poster = useContext(PosterContext);

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

    return (
        <div className="flex flex-col gap-y-1">
            <ScaleButton onClick={onFitToBorders}>Fit To Borders</ScaleButton>
            <ScaleButton onClick={onFillBorders}>Fill Borders</ScaleButton>
            <ScaleButton onClick={onFillCanvas}>Fill Canvas</ScaleButton>
            <div className="flex gap-1">
                <CenterButton onClick={onCenter}>Center</CenterButton>
                <CenterButton onClick={onCenterVertical}>Center Vertically</CenterButton>
                <CenterButton onClick={onCenterHorizontal}>Center Horizontally</CenterButton>
            </div>
        </div>
    );
});

function ScaleButton(props: IButtonProps) {
    return (
        <button className="p-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition font-bold" onClick={props.onClick}>{props.children}</button>
    )
}

function CenterButton(props: IButtonProps) {
    return (
        <button className="p-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition font-bold w-40" onClick={props.onClick}>{props.children}</button>
    )
}

interface IButtonProps {
    onClick: () => void,
    children: React.ReactNode
};

export default Settings;