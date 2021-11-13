import PosterEventHub from "./posterEventHub";

export default class ImageUploader {
    constructor(eventHub: PosterEventHub) {
        this.eventHub = eventHub;

        this.controller = new AbortController();
        this.signal = this.controller.signal;
    }

    eventHub: PosterEventHub;
    controller: AbortController;
    signal: AbortSignal;

    async start(file: File, progressCallback?: (progress: number) => void) {
        const uploadUrl = await this.getPresignedUrl(file);
        this.uploadFile(uploadUrl.uploadUrl, file);
    }

    async getPresignedUrl(file: File): Promise<GetUploadUrlResponse> {
        const url = new URL("https://ot3uw7itn6.execute-api.us-east-1.amazonaws.com/latest");
        url.search = new URLSearchParams({
            contentType: file.type,
        }).toString();

        let response = await fetch(url.toString(), {
            method: 'GET',
            signal: this.signal,
        })
            .then((response) => response.json())
            .catch((err) => {
                if (err.name === 'AbortError') {
                    console.error('Fetch aborted')
                } else {
                    console.error('Error while getting upload url: ', err)
                }

                this.eventHub.triggerEvent('imageUploadCancelled');
            });

        return response as GetUploadUrlResponse;
    }

    uploadFile(signedUrl: string, file: File) {
        fetch(signedUrl, {
            method: 'PUT',
            body: file,
            signal: this.signal,
        })
            .then((response) => {
                return response.text();
            })
            .then((payload) => {
                console.log(payload);
            })
            .catch((err) => {
                if (err.name === 'AbortError') {
                    console.error('Fetch aborted')
                } else {
                    console.error('Error while uploading: ', err)
                }

                this.eventHub.triggerEvent('imageUploadCancelled');
            });
        // TODO: indicate progress
    }

    cancel() {
        this.controller.abort();
    }
}

interface GetUploadUrlResponse {
    uploadUrl: string,
    key: string,
}