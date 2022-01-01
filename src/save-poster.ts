import * as base32 from 'hi-base32';
import handler from './util/handler';
import dynamodb from './util/dynamodb';
import environment from './util/environment';

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

async function savePoster(id: string, posterJson: string) {
	const params = {
		TableName: environment.postersTableName,
		Item: {
			id: id,
			posterJson: posterJson,
		},
	};

	await dynamodb.put(params);
}
