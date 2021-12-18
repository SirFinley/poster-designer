import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { fabric } from 'fabric';
import eventHub from '../class/posterEventHub';
import poster from '../class/poster';
import './ImageUploadArea.css';

import axios from 'axios';
import Settings from "../class/settings";

function ImageUploadArea() {
    const previewImgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filePresent, setFilePresent] = useState(false);
    const [percentage, setPercentage] = useState(0);
    const [rendering, setRendering] = useState(true);
    const [inDropZone, setInDropZone] = useState(false);

    useEffect(() => {
        const imageInput = fileInputRef.current!;
        poster.image.imageInput = imageInput;

        const onImageCleared = () => setFilePresent(false);
        const onImageChanged = () => setRendering(false);
        eventHub.subscribe('imageCleared', onImageCleared);
        eventHub.subscribe('imageChanged', onImageChanged);

        return function cancel() {
            eventHub.remove('imageCleared', onImageCleared);
            eventHub.remove('imageChanged', onImageChanged);
        };
    }, [previewImgRef])

    function onFileSelect(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files![0];
        handleFile(file);
    }

    function handleFile(file: File) {
        setFilePresent(true);

        const imageUploader = new ImageUploader(poster.settings, (progress) => {
            setPercentage(progress);
        });
        imageUploader.start(file);

        // not an image
        if (!/image\//.test(file.type)) {
            return;
        }

        let reader = new FileReader();

        eventHub.subscribe('imageUploadCancelled', abortReader);
        eventHub.subscribe('imageCleared', abortReader);
        function abortReader() {
            reader.abort();
            imageUploader.abort();
        }

        reader.onload = (event) => {
            eventHub.remove('imageUploadCancelled', abortReader);
            eventHub.remove('imageCleared', abortReader);

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

    function preventDefaults(e: Event) {
        e.preventDefault()
        e.stopPropagation()
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        preventDefaults(e.nativeEvent);
        setInDropZone(false);

        const dt = e.dataTransfer!;
        const file = dt.files[0];
        const imageInput = fileInputRef.current!;
        imageInput.files = dt.files;
        handleFile(file);
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
        <div className={`p-3 drop-area ${inDropZone ? 'highlight' : null}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            <form className="m-0">
                <label htmlFor="photo-input">Drag and drop your poster image here or in the editor</label>
                <input type="file" accept="image/*"
                    className="block w-full cursor-pointer bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-transparent text-sm rounded-lg"
                    aria-describedby="user_avatar_help"
                    onChange={onFileSelect}
                    ref={fileInputRef}></input>

                <div className={`flex ${filePresent ? null : 'hidden'} p-2`}>
                    <img ref={previewImgRef} alt="" className={`w-20 h-20 object-scale-down ${rendering ? 'hidden' : null}`} ></img>
                    <div className={`flex justify-center items-center ${!rendering ? 'hidden' : null}`} >
                        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-gray-900" ></div>
                    </div>
                    <div className="p-4 pr-0 w-full">
                        <div className="mb-1 flex justify-between">
                            {percentage < 100 ? (<span className="text-base font-medium">Uploading...</span>) : null}
                            <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div className="bg-gray-600 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

class ImageUploader {
    readonly API_PATH = "upload-image";

    constructor(settings: Settings, onProgress: (progress: number) => void) {
        this.settings = settings;

        this.controller = new AbortController();
        this.progress = 0;
        this.onProgress = onProgress;
    }

    settings: Settings;
    controller: AbortController;
    progress: number;
    onProgress: (progress: number) => void;

    async start(file: File) {
        this.progress = 0;

        // const simulateUpload = () => {
        //     const interval = setInterval(() => {
        //         this.progress += 10;
        //         if (this.progress <= 100) {
        //             this.updateProgress(this.progress);
        //         }
        //     }, 100);
        //     setTimeout(() => {
        //         clearInterval(interval);
        //     }, 1100);
        // };
        // simulateUpload();
        // return;


        try {
            const uploadUrl = await this.getPresignedUrl(file);
            this.uploadFile(uploadUrl.uploadUrl, file);
            poster.settings.originalImageKey = uploadUrl.key;
        } catch (error) {
            // TODO: handle error
        }
    }

    async getPresignedUrl(file: File): Promise<GetUploadUrlResponse> {
        const response = await axios.get<GetUploadUrlResponse>(this.API_PATH, {
            signal: this.controller.signal,
            params: {
                contentType: file.type,
            },
        })
            .catch((err) => {
                if (err.name === 'AbortError') {
                    console.error('Fetch aborted')
                    eventHub.triggerEvent('imageUploadCancelled');
                } else {
                    console.error('Error while getting upload url: ', err)
                }

                throw err;
            });

        if (!response) {
            throw new Error("");
        }

        return response.data;
    }

    uploadFile(signedUrl: string, file: File) {
        axios.put(signedUrl, file, {
            method: 'PUT',
            signal: this.controller.signal,
            headers: {
                'Content-Type': file.type,
            },
            onUploadProgress: (progressEvent) => {
                let percent = Math.round(progressEvent.loaded / progressEvent.total * 100);
                this.updateProgress(percent)
            },
        })
            .catch((err) => {
                if (err.name === 'AbortError') {
                    console.error('Fetch aborted')
                    eventHub.triggerEvent('imageUploadCancelled');
                } else {
                    console.error('Error while uploading file: ', err)
                }

                throw err;
            });
    }

    updateProgress(percent: number) {
        this.onProgress(percent);
        if (percent < 100) {
            this.progress = percent;
        }
        else {
            eventHub.triggerEvent('imageUploaded');
        }
    }

    abort() {
        this.controller.abort();
    }
}

interface GetUploadUrlResponse {
    uploadUrl: string,
    key: string,
}

export default ImageUploadArea;