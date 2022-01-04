import React, { useState, useEffect, useRef, ChangeEvent, useCallback, useContext } from 'react';
import { fabric } from 'fabric';

import DropArea from './DropArea';
import ImageUploader from '../class/imageUploader';
import { PosterContext } from '../util/Context';
import { observer } from 'mobx-react-lite';

const ImageUploadArea = observer(() => {
    const poster = useContext(PosterContext);
    const previewImgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [percentage, setPercentage] = useState(0);

    const handleDrop = useCallback((files: FileList) => {
        const imageInput = fileInputRef.current!;
        imageInput.files = files;
        handleFile(files[0]);
    }, [fileInputRef]);

    useEffect(() => {
        poster.image.imageInput = fileInputRef.current!;
        poster.image.uploadFile = handleDrop;

    }, [previewImgRef, handleDrop])

    function onFileSelect(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files![0];
        handleFile(file);
    }

    function handleFile(file: File) {
        setPercentage(0);

        poster.image.renderStatus = 'none';
        poster.image.uploadStatus = 'none';
        const imageUploader = new ImageUploader(poster.settings, {
            onProgress: (progress) => setPercentage(progress),
            onComplete: (key) => {
                poster.settings.originalImageKey = key;
                poster.image.uploadStatus = 'uploaded';
            },
            onCancelled: () => poster.image.uploadStatus = 'none',
        });
        imageUploader.start(file);

        // not an image
        if (!/image\//.test(file.type)) {
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            const src = event.target!.result as string;

            const imgElem = previewImgRef.current!;
            imgElem.src = src;
            imgElem.onload = () => {
                const image = new fabric.Image(imgElem)
                poster.image.setNewImage(image);
            };
            poster.image.imgElem = imgElem;

            poster.image.renderStatus = 'rendering';
        }

        reader.readAsDataURL(file);
    }

    const uploadComplete = percentage === 100;
    const filePresent = !!poster.image.image;
    const rendering = poster.image.renderStatus === 'rendering';

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
});

export default ImageUploadArea;