declare module 'claudia-api-builder'{
    class ApiResponse{
        public constructor(response : any, headers : any, code?: any);
    }
    export default class ApiBuilder {
        public static ApiResponse : typeof ApiResponse;
        get(uri : string, callback : Function, options?: ApiOptions) : void;
        put(uri : string, callback : Function, options?: ApiOptions) : void;
        post(uri : string, callback : Function, options?: ApiOptions) : void;
        // any(uri : string, callback : Function) : void;
    }

    interface ApiOptions {
        success: {
            contentType: ContentType,
            error? : {code: number}
        }
    }

    type ContentType = 'text/plain' | 'text/html' | 'text/xml' | 'application/xml' | 'application/json';
}