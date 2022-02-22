import { S3 } from 'aws-sdk';
import * as base32 from 'hi-base32';
import { randomUUID } from 'crypto';
import handler from './util/handler';
import dynamodb from './util/dynamodb';
import environment from './util/environment';
import { SaveData } from './render/saveData';

export const main = handler(async (event) => {
	const posterId = event.queryStringParameters?.['posterId'] as string|null|undefined;
	const posterJson = event.body as string;
	const saveData = JSON.parse(posterJson) as SaveData;

	const id = posterId || await getId(saveData);
	const updatedImageKey = moveImage(id, saveData);
	const thumbnailUrl = getThumbnailUrl(id, saveData);
	saveData.imageKey = await updatedImageKey;
	await savePoster(id, saveData);

	return {
		id,
		thumbnailUrl: await thumbnailUrl,
	};
});

async function getId(saveData: SaveData) {
	if (saveData.idType === 'guid') {
		return randomUUID();
	}

	function randByte() {
		return Math.round(Math.random() * 256); // random last byte
	}

	// get count from dynamodb
	const count = await updateAndIncreaseCounter();

	// get bytes
	const buffer = new ArrayBuffer(4); // 4 bytes in Int32
	const view = new DataView(buffer);
	view.setUint32(0, count, false); // byteOffset = 0; litteEndian = false;

	// 5 bytes in base32 string, also mix bytes to look more random, use lower
	const arr = [randByte(), view.getUint8(1), view.getUint8(3), view.getUint8(2), randByte()];

	const base32Id = base32.encode(arr);
	return base32Id;
}

async function updateAndIncreaseCounter(): Promise<number> {
	const itemId = "poster";

	const params = {
		TableName: environment.countsTableName,
		Key: {
			"name": itemId,
		},
		UpdateExpression: "Set counts = if_not_exists(counts, :zero) + :increase",
		ExpressionAttributeValues: {
			":increase": 1,
			":zero": 0
		},
		ReturnValues: "UPDATED_NEW"
	};

	const result = await dynamodb.update(params);
	const count = result?.Attributes?.counts;
	if (!count || typeof count !== 'number') {
		throw new Error('Unable to retrieve new count value');
	}

	return count;
}

async function savePoster(id: string, saveData: SaveData) {
	const params = {
		TableName: environment.postersTableName,
		Item: {
			id: id,
			posterJson: JSON.stringify(saveData),
			timeAdded: new Date().toISOString(),
		},
	};

	await dynamodb.put(params);
}

async function getThumbnailUrl(posterId: string, saveData: SaveData): Promise<string> {
	const sourceKey = saveData.imageThumbnailKey;
	const fileExt = sourceKey.split('.').pop();
	const targetKey = `${posterId}/${randomUUID()}.${fileExt}`;

	await copyS3(environment.bucketName, sourceKey, environment.thumbnailBucketName, targetKey);
	return `https://${environment.thumbnailBucketName}.s3.amazonaws.com/${targetKey}`;
}

async function moveImage(posterId:string, saveData: SaveData): Promise<string> {
	const sourceKey = saveData.imageKey;
	const fileExt = sourceKey.split('.').pop();
	const targetKey = `${posterId}/upload.${fileExt}`;
	
	await copyS3(environment.bucketName, sourceKey, environment.bucketName, targetKey);
	return targetKey;
}

async function copyS3(sourceBucket: string, sourceKey: string, targetBucket: string, targetKey: string): Promise<void> {
	// attempted to copy to self, can skip
	if (sourceBucket === targetBucket && sourceKey === targetKey) {
		return;
	}

	const s3 = new S3();
	const request: S3.CopyObjectRequest = {
		Bucket: targetBucket,
		CopySource: `/${sourceBucket}/${sourceKey}`,
		Key: targetKey,
	};

	try {
		const result = await s3.copyObject(request).promise();
		console.log(result.CopyObjectResult);
	} catch (error) {
		console.log(error);
		throw error;
	}
}

