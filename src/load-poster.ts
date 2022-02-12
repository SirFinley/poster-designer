import { getDownloadUrl } from './render/s3';
import handler from './util/handler';
import dynamodb from './util/dynamodb';
import environment from './util/environment';
import { SaveData } from './render/saveData';
import { PosterItem } from './util/posterItem';

export const main = handler(async (event) => {
	const posterId = event.queryStringParameters?.['posterId'] as string;

	const saveData = await getPosterSaveData(posterId);
    const imageUrl = await getImageUrl(saveData);

	return {
		saveData,
		originalImageUrl: imageUrl,
	};
});

async function getPosterSaveData(posterId: string): Promise<SaveData> {
    const params = {
        TableName: environment.postersTableName,
        Key: { "id": posterId },
    };

    const response = await dynamodb.get(params);
    if (!response.Item) {
        throw new Error(`Item with id ${posterId} not found`);
    }

    const posterItem = response.Item as PosterItem;
    const saveData = JSON.parse(posterItem.posterJson) as SaveData;
    return saveData;
}

async function getImageUrl(saveData: SaveData): Promise<string> {
    return await getDownloadUrl(saveData.imageKey);
}

