import axios from 'axios';
import Settings from './settings';

export default class ImageUploader {
    readonly API_PATH = "upload-image";

    constructor(settings: Settings, options: UploadOptions) {
        this.settings = settings;
        this.options = options;

        this.controller = new AbortController();
        this.progress = 0;
    }

    settings: Settings;
    controller: AbortController;
    progress: number;
    options: UploadOptions;

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
            await this.uploadFile(uploadUrl.uploadUrl, file);
            this.options.onComplete(uploadUrl.key);
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
                    this.options.onCancelled?.();
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

    async uploadFile(signedUrl: string, file: File) {
        await axios.put(signedUrl, file, {
            method: 'PUT',
            signal: this.controller.signal,
            headers: {
                'Content-Type': file.type,
            },
            onUploadProgress: (progressEvent) => {
                if (!progressEvent.total) {
                    return;
                }
                const percent = Math.round(progressEvent.loaded / progressEvent.total * 100);
                this.updateProgress(percent)
            },
        })
            .catch((err) => {
                if (err.name === 'AbortError') {
                    console.error('Fetch aborted')
                    this.options.onCancelled?.();
                } else {
                    console.error('Error while uploading file: ', err)
                }

                throw err;
            });
    }

    updateProgress(percent: number) {
        this.options.onProgress?.(percent);
        this.progress = percent;
    }

    abort() {
        this.controller.abort();
    }
}

interface GetUploadUrlResponse {
    uploadUrl: string,
    key: string,
}

interface UploadOptions {
    onComplete: (key: string) => void;
    onProgress?: (progress: number) => void;
    onCancelled?: () => void,
}
