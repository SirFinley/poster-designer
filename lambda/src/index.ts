import ApiBuilder from 'claudia-api-builder';
import { S3 } from 'aws-sdk';
import { randomUUID } from 'crypto';
import { hasUncaughtExceptionCaptureCallback } from 'process';

const api = new ApiBuilder();
api.get('/', 
	(event, context) => getUploadUrl(event, context),
	{
		success: { contentType: 'application/json' },
	}
);

export = api;

const URL_EXPIRATION_SECONDS = 5 * 60;
async function getUploadUrl(event, context) {
	const contentType = event['queryString']['contentType'];
	if (! /image\/.+/.test(contentType)){
		throw new Error('Invalid content type, must be an image');
	}

	const fileExt = contentType.split('/').pop();
	const key = `${randomUUID()}.${fileExt}`;

	// Get signed URL from S3
	let s3 = new S3();
	const s3Params = {
		Bucket: process.env.UploadBucket,
		Key: key,
		Expires: URL_EXPIRATION_SECONDS,
		ContentType: contentType,

		// This ACL makes the uploaded object publicly readable. You must also uncomment
		// the extra permission for the Lambda function in the SAM template.

		// ACL: 'public-read'
	}

	const uploadUrl = await s3.getSignedUrlPromise('putObject', s3Params);
	return {
		uploadUrl,
		key,
	};
}