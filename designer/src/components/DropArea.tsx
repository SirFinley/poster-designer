import React, { useState } from 'react';
import './DropArea.css';

export default function DropArea(props: IDropAreaProps) {
    const [inDropZone, setInDropZone] = useState(false);

    function preventDefaults(e: Event) {
        e.preventDefault()
        e.stopPropagation()
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        preventDefaults(e.nativeEvent);
        setInDropZone(false);

        const dt = e.dataTransfer!;
        props.onDrop(dt.files);
    }

    function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
        preventDefaults(e.nativeEvent);
        setInDropZone(true);
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        preventDefaults(e.nativeEvent);
        setInDropZone(true);
    }

    function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
        preventDefaults(e.nativeEvent);
        setInDropZone(false);
    }

    return (
        <div className={`w-full h-full ${props.unstyled ? '' : 'drop-area'} ${inDropZone ? 'drop-highlight' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            {props.children}
        </div>
    );
}

interface IDropAreaProps {
    unstyled?: boolean,
    onDrop: (files: FileList) => void,
    children: React.ReactNode
};