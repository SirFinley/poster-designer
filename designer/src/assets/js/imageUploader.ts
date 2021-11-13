import PosterEventHub from "./posterEventHub";
import axios from 'axios';

export default class ImageUploader {
    constructor(eventHub: PosterEventHub) {
        this.eventHub = eventHub;

        this.imageUploadCard = document.getElementById("img-upload-card") as HTMLElement;
        this.imagePreviewElem = document.getElementById("img-preview") as HTMLImageElement;
        this.imagePreviewSpinnerElem = document.getElementById("img-preview-spinner") as HTMLElement;
        this.progressElem = document.getElementById("img-progress") as HTMLProgressElement;
        this.progressLabelElem = document.getElementById("img-progress-label") as HTMLLabelElement;
        this.controller = new AbortController();
        this.signal = this.controller.signal;

        this.eventHub.subscribe('imageChanged', () => {
            showElement(this.imagePreviewElem, true);
            showElement(this.imagePreviewSpinnerElem, false);
        })
    }

    eventHub: PosterEventHub;
    controller: AbortController;
    imageUploadCard: HTMLElement;
    imagePreviewElem: HTMLImageElement;
    imagePreviewSpinnerElem: HTMLElement;
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
            } else {
                console.error('Error while getting upload url: ', err)
                throw err;
            }

            this.eventHub.triggerEvent('imageUploadCancelled');
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
            } else {
                console.error('Error while getting upload url: ', err)
                throw err;
            }

            this.eventHub.triggerEvent('imageUploadCancelled');
        });
    }

    initializeProgress(){
        showElement(this.imageUploadCard, true);
        showElement(this.imagePreviewElem, false);
        showElement(this.imagePreviewSpinnerElem, true);
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

function showElement(elem: HTMLElement, show: boolean) {
    if (show) {
        elem.classList.remove('hidden');
    }
    else{
        elem.classList.add('hidden');
    }
}
interface GetUploadUrlResponse {
    uploadUrl: string,
    key: string,
}