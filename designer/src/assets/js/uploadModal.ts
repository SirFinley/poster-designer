import PosterEventHub from "./posterEventHub";

export default class UploadModal {
    constructor(eventHub: PosterEventHub) {

        this.uploadModal = document.getElementById('intro-upload-modal')!;

        const closeButton = document.getElementById('close-upload-modal-btn');
        closeButton?.addEventListener('click', () => {
            this.closeModal();
        })

        eventHub.subscribe('imageChanged', () => {
            this.closeModal();
        })
    }

    uploadModal: HTMLElement;

    closeModal() {
        this.uploadModal.classList.add('hidden');
    }
}