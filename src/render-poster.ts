import Render, { RenderKeys } from "./render/render";
import { getDownloadUrl } from './render/s3';
import { updateRenders } from './render/dynamo';
import handler from './util/handler';
import dynamodb from './util/dynamodb';
import environment from './util/environment';

export const main = handler(async (event) => {
	const unparsedPosterId = event.queryStringParameters!['posterId'] as string;
    const posterId = unparsedPosterId.replace('<', '').replace('>', '');

    try {
        const result = await render(posterId);
        console.log(result);
        return result;
    } catch (error) {
        console.log(error);
        throw(error);
    }
});

async function getPosterItem(id: string) {
    const params = {
        TableName: environment.postersTableName,
        Key: { "id": id },
    };

    const response = await dynamodb.get(params);
    if (!response.Item) {
        throw new Error(`Item with id ${id} not found`);
    }

    return response.Item;
}

async function render(posterId: string) {
    const item = await getPosterItem(posterId) as PosterItem;

    // already rendered
    if (item.fullRenderKey && item.previewRenderKey) {
        return await getRenderUrls({
            fullRenderKey: item.fullRenderKey,
            previewRenderKey: item.previewRenderKey
        });
    }

    // save rendered image to s3
    // save thumbnail image to s3
    const saveData = JSON.parse(item.posterJson);
    const renderKeys = await new Render().render(posterId, saveData);

    // copy original image to `${posterId}/originalKey`

    // update dynamo entry with full-render s3 key
    await updateRenders(posterId, renderKeys);

    // delete originalImageKey

    // get image urls
    return await getRenderUrls(renderKeys);
}

async function getRenderUrls(renderKeys: RenderKeys) {
    const fullUrl = getDownloadUrl(renderKeys.fullRenderKey);
    const previewUrl = getDownloadUrl(renderKeys.previewRenderKey);
    await Promise.all([fullUrl, previewUrl]);
    return {
        fullUrl: await fullUrl,
        previewUrl: await previewUrl,
    }
}

interface PosterItem {
    id: string,
    posterJson: any,
    fullRenderKey?: string,
    previewRenderKey?: string,
}