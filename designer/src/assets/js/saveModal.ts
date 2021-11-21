import { fabric } from 'fabric';
import axios from "axios";
import Settings from "./settings";
import PosterExporter from './PosterExporter';
import PosterImage from './image';
import PosterEventHub from './posterEventHub';

export default class SaveModal {
    readonly apiUrl = "https://bqq1e7cavi.execute-api.us-east-1.amazonaws.com/latest";

    constructor(image: PosterImage, canvas: fabric.Canvas, settings: Settings, eventHub: PosterEventHub) {
        this.image = image;
        this.canvas = canvas;
        this.settings = settings;

        this.controller = new AbortController();
        this.signal = this.controller.signal;

        this.saveButton = document.getElementById('save-button') as HTMLButtonElement;
        this.saveModal = document.getElementById('save-modal') as HTMLElement;
        this.modalCloseButton = document.getElementById('save-modal-close-btn') as HTMLButtonElement;
        this.posterIdDisplay = document.getElementById('poster-id') as HTMLElement;

        this.saveButton.addEventListener('click', () => {
            this.initializeModal();
            this.upload();
        });

        this.modalCloseButton.addEventListener('click', () => {
            this.saveModal.classList.add('hidden');
        })

        eventHub.subscribe('imageUploaded', () => this.enableSaveButton());
        eventHub.subscribe('imageCleared', () => this.disableSaveButton());
    }

    image: PosterImage;
    canvas: fabric.Canvas;
    settings: Settings;

    controller: AbortController;
    signal: AbortSignal;

    saveButton: HTMLButtonElement;
    saveModal: HTMLElement;
    posterIdDisplay: HTMLElement;
    modalCloseButton: HTMLButtonElement;

    initializeModal() {
        this.saveModal.classList.remove('hidden');
        this.posterIdDisplay.innerText = 'Getting id...';
    }

    async upload() {
        const data = await this.getPostData();
        let response = await axios.post<SavePosterResponse>(this.apiUrl, data, {
            method: 'POST',
            signal: this.signal,
        })
        .catch((err) => {
            if (err.name === 'AbortError') {
                console.error('Fetch aborted')
            } else {
                console.error('Error while saving poster: ', err)
                throw err;
            }
        });

        if (response) {
            let id = response.data.id
            this.posterIdDisplay.innerText = `<${id}>`;
            console.log('poster saved with id ' + id);
        }
    }

    private async getPostData() {
        return await new PosterExporter().getSaveData(this.settings, this.canvas, this.image);
    }

    private enableSaveButton() {
        this.saveButton.disabled = false;
    }

    private disableSaveButton() {
        this.saveButton.disabled = true;
    }
}

interface SavePosterResponse {
    id: string,
};