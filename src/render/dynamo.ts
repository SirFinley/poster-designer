import { RenderKeys } from "./render";
import dynamodb from "../util/dynamodb";
import environment from '../util/environment';

export async function updateRenders(id: string, renderKeys: RenderKeys) {
	const params = {
		TableName: environment.postersTableName,
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

	return await dynamodb.update(params);
}