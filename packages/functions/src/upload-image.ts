import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
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
	const key = `uploads/${randomUUID()}.${fileExt}`;

	// Get signed URL from S3
	const s3 = new S3();
	const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({
		Bucket: environment.bucketName,
		Key: key,
		ContentType: contentType,


		// This ACL makes the uploaded object publicly readable. You must also uncomment
		// the extra permission for the Lambda function in the SAM template.

		// ACL: 'public-read'
	}), {
		expiresIn: URL_EXPIRATION_SECONDS,
	});
	return {
		uploadUrl,
		key,
	};
});