import ApiBuilder from 'claudia-api-builder';
import { S3 } from 'aws-sdk';
import { randomUUID } from 'crypto';

const api = new ApiBuilder();
api.get('/', 
	(event) => getUploadUrl(event),
	{
		success: { contentType: 'application/json' },
	}
);

export = api;

const URL_EXPIRATION_SECONDS = 5 * 60;
async function getUploadUrl(event) {

	const key = randomUUID();
	const contentType = 'image/jpeg';

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
		event,
		uploadUrl,
		key,
	};
}