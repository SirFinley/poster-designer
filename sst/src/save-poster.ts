import AWS from 'aws-sdk';
import * as base32 from 'hi-base32';
import handler from './util/handler';

const COUNTS_TABLE = process.env.COUNTS_TABLE_NAME!;
const POSTERS_TABLE = process.env.POSTERS_TABLE_NAME!;
const REGION = process.env.REGION!;

export const main = handler(async (event) => {
	const posterJson = event.body as string;

	const id = await getId();
	await savePoster(id, posterJson);

	return {
		id,
	};
});

async function getId() {
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

async function updateAndIncreaseCounter() {
	const itemId = "poster";

	const docClient = new AWS.DynamoDB.DocumentClient({
		region: REGION,
	});

	const params = {
		TableName: COUNTS_TABLE,
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

	const result = await docClient.update(params).promise();
	return result!.Attributes!.counts
}

async function savePoster(id: string, posterJson: string) {
	const docClient = new AWS.DynamoDB.DocumentClient({
		region: REGION,
	});

	const params = {
		TableName: POSTERS_TABLE,
		Item: {
			id: id,
			posterJson: posterJson,
		},
	};

	await docClient.put(params).promise();
}
