import { useEffect, useRef, ChangeEvent } from 'react';
import poster from '../class/poster';
import './ImageUploadArea.css';

function ImageUploadArea() {
    const dropAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const dropArea = dropAreaRef.current!;
        const imageInput = fileInputRef.current!;
        poster.image.imageInput = imageInput;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        })

        function preventDefaults(e: Event) {
            e.preventDefault()
            e.stopPropagation()
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        })

        dropArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer!;
            const file = dt.files[0];
            imageInput.files = dt.files;
            poster.image.handleFile(file);
        });

        function highlight() {
            dropArea.classList.add('highlight')
        }

        function unhighlight() {
            dropArea.classList.remove('highlight')
        }
    }, [dropAreaRef])

    function onFileSelect(e: ChangeEvent<HTMLInputElement>) {
        const target = e.target;
        poster.image.handleFile(target.files![0]);
    }

    return (
        <div id="" className="p-3 drop-area" ref={dropAreaRef}>
            <form className="m-0">
                <label htmlFor="photo-input">Drag and drop your poster image here or in the editor</label>
                <input id="photo-input" type="file" accept="image/*"
                    className="block w-full cursor-pointer bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-transparent text-sm rounded-lg"
                    aria-describedby="user_avatar_help"
                    onChange={onFileSelect}
                    ref={fileInputRef}></input>
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
    );
}

export default ImageUploadArea;