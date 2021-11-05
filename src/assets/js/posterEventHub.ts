export default class PosterEventHub extends EventTarget {
    constructor() {
        super();
    }

    // events
    subscribe(type: PosterEventType, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean) {
        this.addEventListener(type, callback, options);
    }

    triggerEvent(type: PosterEventType) {
        this.dispatchEvent(new Event(type));
    }
}

export type PosterEventType = 'sizeSettingChanged'
    | 'orientationSettingChanged'
    | 'borderSettingChanged'
    | 'imageChanged'
    | 'colorChanged';