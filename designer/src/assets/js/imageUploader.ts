import PosterEventHub from "./posterEventHub";
import axios from 'axios';
import Settings from "./settings";

export default class ImageUploader {
    readonly apiUrl = "https://ot3uw7itn6.execute-api.us-east-1.amazonaws.com/latest";

    constructor(settings: Settings, eventHub: PosterEventHub) {
        this.settings = settings;
        this.eventHub = eventHub;

        this.imagePreviewElem = document.getElementById("img-preview") as HTMLImageElement;
        this.imagePreviewSpinnerElem = document.getElementById("img-preview-spinner") as HTMLElement;
        this.imageUploadCard = document.getElementById("img-upload-card") as HTMLElement;
        this.progressElem = document.getElementById("img-progress") as HTMLProgressElement;
        this.progressLabelElem = document.getElementById("img-progress-label") as HTMLLabelElement;
        this.controller = new AbortController();

        this.eventHub.subscribe('imageChanged', () => {
            showElement(this.imagePreviewElem);
            hideElement(this.imagePreviewSpinnerElem);
        });

        this.eventHub.subscribe('imageCleared', () => {
            hideElement(this.imageUploadCard);
        });
    }

    settings: Settings;
    eventHub: PosterEventHub;
    controller: AbortController;
    imagePreviewElem: HTMLImageElement;
    imagePreviewSpinnerElem: HTMLElement;
    imageUploadCard: HTMLElement;
    progressElem: HTMLProgressElement;
    progressLabelElem: HTMLLabelElement;

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
            this.cancel(); // attempt to cancel ongoing upload

            this.initializeProgress();
            const uploadUrl = await this.getPresignedUrl(file);
            this.uploadFile(uploadUrl.uploadUrl, file);
            this.settings.originalImageKey = uploadUrl.key;
        } catch (error) {
            // TODO: handle error
        }
    }

    private async getPresignedUrl(file: File): Promise<GetUploadUrlResponse> {
        let response = await axios.get<GetUploadUrlResponse>(this.apiUrl, {
            signal: this.controller.signal,
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
            }

            throw err;
        });

        if (!response) {
            throw new Error("");
        }

        return response.data;
    }

    private uploadFile(signedUrl: string, file: File) {
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
                this.eventHub.triggerEvent('imageUploadCancelled');
            } else {
                console.error('Error while uploading file: ', err)
            }

            throw err;
        });
    }

    private initializeProgress(){
        showElement(this.imageUploadCard);
        hideElement(this.imagePreviewElem);
        showElement(this.imagePreviewSpinnerElem);
        this.updateProgress(0);
    }
    
    private updateProgress(percent: number){
        if (percent < 100){
            this.progressLabelElem.innerText = `Uploading... ${percent}%`
        }
        else {
            this.progressLabelElem.innerText = "Uploaded!";
            this.eventHub.triggerEvent('imageUploaded');
        }

        this.progressElem.value = percent;
    }

    private cancel() {
        this.controller.abort();
        this.controller = new AbortController();
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