interface IMessage {
    type: string;
    data: any;
}

export function postMessage(message: IMessage) {
    console.log("post message:");
    console.log(message);
    
    if (window.top && document.referrer){
        window.top?.postMessage(
            JSON.stringify(message), 
            document.referrer,
        );
    }
}