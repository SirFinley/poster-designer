"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const claudia_api_builder_1 = __importDefault(require("claudia-api-builder"));
const aws_sdk_1 = require("aws-sdk");
const crypto_1 = require("crypto");
const api = new claudia_api_builder_1.default();
api.get('/', (event, context) => getUploadUrl(event, context), {
    success: { contentType: 'application/json' },
});
const URL_EXPIRATION_SECONDS = 5 * 60;
function getUploadUrl(event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const contentType = event['queryString']['contentType'];
        if (!/image\/.+/.test(contentType)) {
            throw new Error('Invalid content type, must be an image');
        }
        const fileExt = contentType.split('/').pop();
        const key = `${(0, crypto_1.randomUUID)()}.${fileExt}`;
        // Get signed URL from S3
        let s3 = new aws_sdk_1.S3();
        const s3Params = {
            Bucket: process.env.UploadBucket,
            Key: key,
            Expires: URL_EXPIRATION_SECONDS,
            ContentType: contentType,
            // This ACL makes the uploaded object publicly readable. You must also uncomment
            // the extra permission for the Lambda function in the SAM template.
            // ACL: 'public-read'
        };
        const uploadUrl = yield s3.getSignedUrlPromise('putObject', s3Params);
        return {
            // event,
            // context,
            uploadUrl,
            key,
        };
    });
}
module.exports = api;
