import { S3 } from 'aws-sdk';
import { randomUUID } from 'crypto';
import handler from './util/handler';
import environment from './util/environment';

const URL_EXPIRATION_SECONDS = 5 * 60;

export const main = handler(async (event) => {
	const contentType = event.queryStringParameters?.['contentType'];
	if (!contentType) {
		throw new Error('Parameter contentType not specified');
	}
	
	if (! /image\/.+/.test(contentType)){
		throw new Error('Invalid content type, must be an image');
	}

	const fileExt = contentType.split('/').pop();
	const key = `${randomUUID()}.${fileExt}`;

	// Get signed URL from S3
	const s3 = new S3();
	const s3Params = {
		Bucket: environment.bucketName,
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
});