import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { fabric } from 'fabric';
import eventHub from '../class/posterEventHub';
import poster from '../class/poster';

import DropArea from './DropArea';
import ImageUploader from '../class/imageUploader';

function ImageUploadArea() {
    const previewImgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filePresent, setFilePresent] = useState(false);
    const [percentage, setPercentage] = useState(0);
    const [rendering, setRendering] = useState(true);

    useEffect(() => {
        const imageInput = fileInputRef.current!;
        poster.image.imageInput = imageInput;
        poster.image.uploadFile = handleDrop;

        const onImageCleared = eventHub.subscribe('imageCleared', () => setFilePresent(false));
        const onImageChanged = eventHub.subscribe('imageChanged', () => setRendering(false));

        return function cancel() {
            onImageCleared.unsubscribe();
            onImageChanged.unsubscribe();
        };
    }, [previewImgRef])

    function onFileSelect(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files![0];
        handleFile(file);
    }

    function handleFile(file: File) {
        setFilePresent(true);
        setPercentage(0);

        const imageUploader = new ImageUploader(poster.settings, {
            onProgress: (progress) => setPercentage(progress),
            onComplete: (key) => poster.settings.originalImageKey = key,
            onCancelled: () => eventHub.triggerEvent('imageUploadCancelled'),
        });
        imageUploader.start(file);

        // not an image
        if (!/image\//.test(file.type)) {
            return;
        }

        const reader = new FileReader();

        const onImageUploadCancelled = eventHub.subscribe('imageUploadCancelled', abortReader);
        const onImageCleared = eventHub.subscribe('imageCleared', abortReader);
        function abortReader() {
            reader.abort();
            imageUploader.abort();
        }

        reader.onload = (event) => {
            onImageUploadCancelled.unsubscribe();
            onImageCleared.unsubscribe();

            const src = event.target!.result as string;

            const imgElem = previewImgRef.current!;
            imgElem.src = src;
            imgElem.onload = () => {
                const image = new fabric.Image(imgElem)
                poster.image.setNewImage(image);
                setRendering(false);
            };
            poster.image.imgElem = imgElem;

            setRendering(true);
        }

        reader.readAsDataURL(file);
    }

    function handleDrop(files: FileList) {
        const imageInput = fileInputRef.current!;
        imageInput.files = files;
        handleFile(files[0]);
    }

    const uploadComplete = percentage === 100;

    return (
        <DropArea onDrop={handleDrop} >
            <div className='p-3'>
                <form className="m-0">
                    <label htmlFor="photo-input">Drag and drop your poster image here or in the editor</label>
                    <input type="file" accept="image/*"
                        className="block w-full cursor-pointer bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-transparent text-sm rounded-lg"
                        aria-describedby="user_avatar_help"
                        onChange={onFileSelect}
                        ref={fileInputRef}></input>

                    <div className={`flex p-2 ${!filePresent && 'hidden'}`}>
                        <img ref={previewImgRef} alt="" className={`w-20 h-20 object-scale-down ${rendering && 'hidden'}`} ></img>
                        <div className={`flex justify-center items-center ${!rendering && 'hidden'}`} >
                            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-gray-900" ></div>
                        </div>
                        <div className="p-4 pr-0 w-full">
                            <div className="mb-1 flex justify-between">
                                <span className="text-base font-medium">{uploadComplete ? 'Uploaded!' : 'Uploading...'}</span>
                                {!uploadComplete && <span className="text-sm font-medium">{percentage}%</span>}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div className="bg-gray-600 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DropArea>
    );
}

export default ImageUploadArea;