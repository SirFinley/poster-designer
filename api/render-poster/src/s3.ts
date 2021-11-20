import { S3 } from "aws-sdk";
import { randomUUID } from "crypto";

const BUCKET = 'visual-inkworks-dev';
const URL_EXPIRATION_SECONDS = 24 * 60 * 60; // 24 hours

export async function getDownloadUrl(key: string) {
    let s3 = new S3();
    const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: BUCKET,
        Key: key,
        Expires: URL_EXPIRATION_SECONDS,
    });

    return url;
}

export async function uploadImage(buffer: Buffer, key: string) {
    const object = {
        Bucket: BUCKET,
        Key: key,
        // ACL: "public-read",
        Body: buffer
    };

    try {
        const s3 = new S3();
        await s3.putObject(object).promise();
        return key;
    } catch (err) {
        console.error("Failed to store image: " + err);
        throw err;
    }
}