export class PosterEventHub {
    constructor() {
        this.eventTarget = new EventTarget();
    }

    eventTarget: EventTarget;

    // events
    subscribe(type: PosterEventType, callback: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean) {
        this.eventTarget.addEventListener(type, callback, options);
        return new EventSubscription(this, type, callback);
    }

    triggerEvent(type: PosterEventType) {
        this.eventTarget.dispatchEvent(new Event(type));
    }

    remove(type: PosterEventType, callback: EventListenerOrEventListenerObject) {
        this.eventTarget.removeEventListener(type, callback);
    }
}

class EventSubscription {
    constructor(eventHub: PosterEventHub, type: PosterEventType, callback: EventListenerOrEventListenerObject) {
        this.eventHub = eventHub;
        this.type = type;
        this.callback = callback;
    }

    private eventHub: PosterEventHub;
    private type: PosterEventType;
    private callback: EventListenerOrEventListenerObject;

    unsubscribe() {
        this.eventHub.remove(this.type, this.callback);
    }
}

const eventHub = new PosterEventHub();
export default eventHub;

export type PosterEventType = 'sizeSettingChanged'
    | 'orientationSettingChanged'
    | 'borderSettingChanged'
    | 'imageChanged'
    | 'colorChanged'
    | 'imageScaled'
    | 'imageUploaded'
    | 'imageUploadCancelled'
    | 'imageCleared';