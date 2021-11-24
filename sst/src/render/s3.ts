import AWS from "aws-sdk";

const BUCKET = 'visual-inkworks-dev';
const URL_EXPIRATION_SECONDS = 24 * 60 * 60; // 24 hours

const s3 = new AWS.S3();
export async function getDownloadUrl(key: string) {
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
        await s3.putObject(object).promise();
        return key;
    } catch (err) {
        console.error("Failed to store image: " + err);
        throw err;
    }
}