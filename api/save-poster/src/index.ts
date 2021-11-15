import ApiBuilder from 'claudia-api-builder';
import AWS from 'aws-sdk';
import * as base32 from 'hi-base32';

const COUNTS_TABLE = 'counts';
const POSTERS_TABLE = 'posters';
const REGION = 'us-east-1';

const api = new ApiBuilder();
api.post('/',
	(event, context) => postSettings(event, context),
	{
		success: { contentType: 'application/json' },
	}
);

export = api;

async function postSettings(event, context) {
	let posterJson = event.body;

	let id = await getId();
	await savePoster(id, posterJson);

	return {
		id,
	};
}

async function getId() {
	function randByte() {
		return Math.round(Math.random() * 256); // random last byte
	}

	// get count from dynamodb
	let count = await updateAndIncreaseCounter();

	// get bytes
	let buffer = new ArrayBuffer(4); // 4 bytes in Int32
	let view = new DataView(buffer);
	view.setUint32(0, count, false); // byteOffset = 0; litteEndian = false;

	// 5 bytes in base32 string, also mix bytes to look more random, use lower
	let arr = [randByte(), view.getUint8(1), view.getUint8(3), view.getUint8(2), randByte()];

	let base32Id = base32.encode(arr);
	return base32Id;
}

async function updateAndIncreaseCounter() {
	const itemId = "poster";

	var docClient = new AWS.DynamoDB.DocumentClient({
		region: REGION,
	});

	var params = {
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

	let result = await docClient.update(params).promise();
	return result.Attributes.counts
}

async function savePoster(id: string, posterJson: string) {
	let docClient = new AWS.DynamoDB.DocumentClient({
		region: REGION,
	});

	let params = {
		TableName: POSTERS_TABLE,
		Item: {
			id: id,
			posterJson: posterJson,
		},
	};

	await docClient.put(params).promise();
}
