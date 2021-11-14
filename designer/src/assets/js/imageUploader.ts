import PosterEventHub from "./posterEventHub";
import axios from 'axios';

export default class ImageUploader {
    constructor(eventHub: PosterEventHub) {
        this.eventHub = eventHub;

        this.imageClearButton = document.getElementById("btn-clear-image") as HTMLButtonElement;
        this.imagePreviewElem = document.getElementById("img-preview") as HTMLImageElement;
        this.imagePreviewSpinnerElem = document.getElementById("img-preview-spinner") as HTMLElement;
        this.imageUploadCard = document.getElementById("img-upload-card") as HTMLElement;
        this.progressElem = document.getElementById("img-progress") as HTMLProgressElement;
        this.progressLabelElem = document.getElementById("img-progress-label") as HTMLLabelElement;
        this.controller = new AbortController();
        this.signal = this.controller.signal;

        this.eventHub.subscribe('imageChanged', () => {
            showElement(this.imagePreviewElem);
            hideElement(this.imagePreviewSpinnerElem);
        })

        this.imageClearButton.addEventListener('click', () => {
            this.controller.abort();
            hideElement(this.imageUploadCard);
            
            this.eventHub.triggerEvent('imageCleared');
        })
    }

    eventHub: PosterEventHub;
    controller: AbortController;
    imageClearButton: HTMLButtonElement;
    imagePreviewElem: HTMLImageElement;
    imagePreviewSpinnerElem: HTMLElement;
    imageUploadCard: HTMLElement;
    progressElem: HTMLProgressElement;
    progressLabelElem: HTMLLabelElement;
    signal: AbortSignal;

    async start(file: File) {
        // this.initializeProgress();
        // let interval = setInterval(() => {
        //     this.updateProgress(this.progressElem.value + 10);
        // }, 100);
        // setTimeout(()=>{
        //     clearInterval(interval);
        // }, 1100);
        // return;
        try {
            this.initializeProgress();
            const uploadUrl = await this.getPresignedUrl(file);
            this.uploadFile(uploadUrl.uploadUrl, file);
        } catch (error) {
            // TODO: handle error
        }
    }

    async getPresignedUrl(file: File): Promise<GetUploadUrlResponse> {
        const url = "https://ot3uw7itn6.execute-api.us-east-1.amazonaws.com/latest";

        let response = await axios.get<GetUploadUrlResponse>(url, {
            signal: this.signal,
            params: {
                contentType: file.type,
            },
        })
        .catch((err) => {
            if (err.name === 'AbortError') {
                console.error('Fetch aborted')
                this.eventHub.triggerEvent('imageUploadCancelled');
            } else {
                console.error('Error while getting upload url: ', err)
                throw err;
            }
        });

        if (!response) {
            throw new Error("");
        }

        return response.data;
    }

    uploadFile(signedUrl: string, file: File) {
        // let data = new FormData();
        // data.append('file', file);

        axios.put(signedUrl, file, {
            method: 'PUT',
            signal: this.signal,
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
                this.eventHub.triggerEvent('imageUploadCancelled');
            } else {
                console.error('Error while getting upload url: ', err)
                throw err;
            }
        });
    }

    initializeProgress(){
        showElement(this.imageUploadCard);
        hideElement(this.imagePreviewElem);
        showElement(this.imagePreviewSpinnerElem);
        this.updateProgress(0);
    }
    
    updateProgress(percent: number){
        if (percent < 100){
            this.progressLabelElem.innerText = `Uploading... ${percent}%`
        }
        else {
            this.progressLabelElem.innerText = "Uploaded!";
        }

        this.progressElem.value = percent;
    }

    cancel() {
        this.controller.abort();
    }
}

function hideElement(elem: HTMLElement) {
    elem.classList.add('hidden');
}

function showElement(elem: HTMLElement) {
    elem.classList.remove('hidden');
}
interface GetUploadUrlResponse {
    uploadUrl: string,
    key: string,
}