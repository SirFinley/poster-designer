import PosterEventHub from "./posterEventHub";
import Settings from "./settings";

export default class ClearPoster {
    constructor(settings: Settings, eventHub: PosterEventHub) {
        this.settings = settings;
        this.eventHub = eventHub;

        this.clearModal = document.getElementById('clear-modal')!;

        document.getElementById('clear-button')!.addEventListener('click', () => {
            this.showModal();
        })

        document.getElementById('clear-modal-clear-btn')!.addEventListener('click', () => {
            this.clearPoster();
            this.closeModal();
        });

        document.getElementById('clear-modal-close-btn')!.addEventListener('click', () => {
            this.closeModal();
        });
    }

    settings: Settings;
    eventHub: PosterEventHub;
    clearModal: HTMLElement;

    showModal() {
        console.log('show clear modal');
        
        this.clearModal.classList.remove('hidden');
    }

    clearPoster() {
        this.eventHub.triggerEvent('imageCleared');
    }
    
    closeModal() {
        this.clearModal.classList.add('hidden');
    }

}