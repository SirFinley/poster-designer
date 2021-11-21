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
        this.title = document.getElementById('save-modal-title') as HTMLElement;
        this.spinner = document.getElementById('poster-id-spinner') as HTMLElement;
        this.instructions = document.getElementById('save-modal-instructions') as HTMLElement;
        this.copyButton = document.getElementById('save-modal-copy-button') as HTMLButtonElement;
        this.copyTooltip = document.getElementById('copy-tooltip') as HTMLElement;

        this.saveButton.addEventListener('click', () => {
            this.initializeModal();
            this.upload();
        });

        this.modalCloseButton.addEventListener('click', () => {
            this.saveModal.classList.add('hidden');
        });

        this.posterIdDisplay.addEventListener('mouseenter', () => {
            this.copyTooltip.innerText = 'Copy to clipboard';
        });

        this.posterIdDisplay.addEventListener('mouseleave', () => {
            this.copyTooltip.innerText = 'Copy to clipboard';
        });

        this.posterIdDisplay.addEventListener('click', () => {
            this.copyId();
            this.copyTooltip.innerText = 'Copied!';
            console.log('copied');
        });
        this.copyButton.addEventListener('click', () => this.copyId());

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
    title: HTMLElement;
    spinner: HTMLElement;
    instructions: HTMLElement;
    copyButton: HTMLButtonElement;
    copyTooltip: HTMLElement;

    initializeModal() {
        showElement(this.saveModal);
        this.title.innerText = "Saving poster...";
        hideElement(this.posterIdDisplay);
        showElement(this.spinner);
        hideElement(this.instructions);
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
            this.title.innerText = 'Poster Saved!';
            const id = response.data.id
            this.posterIdDisplay.innerText = `<${id}>`;
            showElement(this.posterIdDisplay);
            hideElement(this.spinner);
            showElement(this.instructions);
            console.log('poster saved with id ' + id);
        }
    }

    private async getPostData() {
        return await new PosterExporter().getSaveData(this.settings, this.canvas, this.image);
    }

    private copyId() {
        navigator.clipboard.writeText(this.posterIdDisplay.innerText);
    }

    private enableSaveButton() {
        this.saveButton.disabled = false;
    }

    private disableSaveButton() {
        this.saveButton.disabled = true;
    }
}

function hideElement(elem: HTMLElement) {
    elem.classList.add('hidden');
}

function showElement(elem: HTMLElement) {
    elem.classList.remove('hidden');
}

interface SavePosterResponse {
    id: string,
};