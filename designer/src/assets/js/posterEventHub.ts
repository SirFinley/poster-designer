export default class PosterEventHub {
    constructor() {
        this.eventTarget = new EventTarget();
    }

    eventTarget: EventTarget;

    // events
    subscribe(type: PosterEventType, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean) {
        this.eventTarget.addEventListener(type, callback, options);
    }

    triggerEvent(type: PosterEventType) {
        this.eventTarget.dispatchEvent(new Event(type));
    }

    remove(type: PosterEventType, callback: EventListenerOrEventListenerObject | null){
        this.eventTarget.removeEventListener(type, callback);
    }
}

export type PosterEventType = 'sizeSettingChanged'
    | 'orientationSettingChanged'
    | 'borderSettingChanged'
    | 'imageChanged'
    | 'colorChanged'
    | 'imageScaled'
    | 'imageUploaded'
    | 'imageUploadCancelled'
    | 'imageCleared';