import AWS from "aws-sdk";
import { RenderKeys } from "./version1/render";


const REGION = 'us-east-1';
const POSTERS_TABLE = 'posters';
export async function updateRenders(id: string, renderKeys: RenderKeys) {
	let docClient = new AWS.DynamoDB.DocumentClient({
		region: REGION,
	});

	let params = {
		TableName: POSTERS_TABLE,
		Key: {
			id: id,
		},
        UpdateExpression: 'set fullRenderKey = :full, previewRenderKey = :preview',
        ExpressionAttributeValues: {
            ":full": renderKeys.fullRenderKey,
            ":preview": renderKeys.previewRenderKey,
        },
        ReturnValues: "UPDATED_NEW"
	};

	return await docClient.update(params).promise();
}