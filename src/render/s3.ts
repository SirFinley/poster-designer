import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import environment from "../util/environment";

const URL_EXPIRATION_SECONDS = 24 * 60 * 60; // 24 hours

const s3 = new S3();
export async function getDownloadUrl(key: string) {
    const url = await getSignedUrl(s3, new GetObjectCommand({
        Bucket: environment.bucketName,
        Key: key,
    }), {
        expiresIn: URL_EXPIRATION_SECONDS,
    });

    return url;
}

export async function uploadImage(buffer: Buffer, key: string) {
    const object = {
        Bucket: environment.bucketName,
        Key: key,
        // ACL: "public-read",
        Body: buffer
    };

    try {
        await s3.putObject(object);
        return key;
    } catch (err) {
        console.error("Failed to store image: " + err);
        throw err;
    }
}