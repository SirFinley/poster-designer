import Render, { RenderKeys } from "./render/render";
import { getDownloadUrl } from './render/s3';
import { updateRenders } from './render/dynamo';
import handler from './util/handler';
import dynamodb from './util/dynamodb';
import environment from './util/environment';
import { SaveData } from "./render/saveData";

export const main = handler(async (event) => {
    const unparsedPosterId = event.queryStringParameters?.['posterId'];
    if (!unparsedPosterId) {
        throw new Error('Parameter posterId not specified');
    }

    const posterId = unparsedPosterId.replace('<', '').replace('>', '');

    try {
        const result = await render(posterId);
        console.log(result);
        return result;
    } catch (error) {
        console.log(error);
        throw (error);
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
    const saveData = JSON.parse(item.posterJson) as SaveData;

    // already rendered
    if (item.fullRenderKey && item.previewRenderKey) {
        return await getRenderUrls(saveData, {
            fullRenderKey: item.fullRenderKey,
            previewRenderKey: item.previewRenderKey
        });
    }

    // save rendered image to s3
    // save thumbnail image to s3
    const renderKeys = await new Render().render(posterId, saveData);

    // copy original image to `${posterId}/originalKey`

    // update dynamo entry with full-render s3 key
    await updateRenders(posterId, renderKeys);

    // delete originalImageKey

    // get image urls
    return await getRenderUrls(saveData, renderKeys);
}

async function getRenderUrls(saveData: SaveData, renderKeys: RenderKeys) {
    const fullUrl = getDownloadUrl(renderKeys.fullRenderKey);
    const previewUrl = getDownloadUrl(renderKeys.previewRenderKey);
    const clientThumbnailUrl = getDownloadUrl(saveData.imageThumbnailKey);
    await Promise.all([fullUrl, previewUrl, clientThumbnailUrl]);

    return {
        fullRenderUrl: await fullUrl,
        serverThumbnailUrl: await previewUrl,
        clientThumbnailUrl: await clientThumbnailUrl,
    }
}

interface PosterItem {
    id: string,
    posterJson: string,
    fullRenderKey?: string,
    previewRenderKey?: string,
}