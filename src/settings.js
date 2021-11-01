export default class Settings {
    constructor() {
        this.orientation = 'landscape';
        this.size = '24x36';
        this.leftMargin = 0;
        this.rightMargin = 0;
        this.topMargin = 0;
        this.bottomMargin = 0;
        this.orientationInput = document.getElementById("orientation-input");
        this.sizeInput = document.getElementById("size-input");
        this.leftMarginInput = document.getElementById("left-margin");
        this.rightMarginInput = document.getElementById("right-margin");
        this.topMarginInput = document.getElementById("top-margin");
        this.bottomMarginInput = document.getElementById("bottom-margin");
        this.leftMarginInput.addEventListener('input', onInput);
        this.rightMarginInput.addEventListener('input', onInput);
        let self = this;
        function onInput(e) {
            console.log(this.id);
            let value = parseInt(this.value);
            if (this.id === 'left-margin') {
                self.leftMargin = value;
            }
            else if (this.id === 'right-margin') {
                self.rightMargin = value;
            }
            else if (this.id === 'top-margin') {
                self.topMargin = value;
            }
            else if (this.id === 'bottom-margin') {
                self.bottomMargin = value;
            }
        }
    }
    populateInputOptions() {
        // fill dropdown options
    }
    readSettingsFromUrl(urlStr) {
        let url = new URL(urlStr);
        // TODO - validate orientation and size are set, display warning if they are not
        // TODO - map from etsy variation id to option
        const map = {
            "18x24": "18x24",
            "24x36": "24x36",
            "landscape": "landscape",
            "portrait": "portrait",
        };
        let orientation = url.searchParams.get('orientation');
        let size = url.searchParams.get('size');
        if (orientation) {
            this.orientationInput.value = map[orientation];
        }
        if (size) {
            this.sizeInput.value = map[size];
        }
    }
}
