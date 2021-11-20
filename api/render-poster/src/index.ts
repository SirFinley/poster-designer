import AWS from 'aws-sdk';
import Render, { RenderKeys } from "./version1/render";
import { getDownloadUrl } from './s3';
import { updateRenders } from './dynamo';
import ApiBuilder from 'claudia-api-builder';

const REGION = 'us-east-1';
const POSTERS_TABLE = 'posters';

const api = new ApiBuilder();
api.get('/',
	(event, context) => postRender(event, context),
	{
		success: { contentType: 'application/json' },
	}
);

export = api;

async function postRender(event, context) {
	const unparsedPosterId = event['queryString']['posterId'];
    const posterId =unparsedPosterId.replace('<', '').replace('>', '');

    try {
        const result = await render(posterId);
        console.log(result);
        return result;
    } catch (error) {
        console.log(error);
        throw(error);
    }
}

async function getPosterItem(id: string) {
    var docClient = new AWS.DynamoDB.DocumentClient({
        region: REGION,
    });

    let params = {
        TableName: POSTERS_TABLE,
        Key: { "id": id },
    };

    const response = await docClient.get(params).promise();
    if (!response.Item) {
        throw new Error(`Item with id ${id} not found`);
    }

    return response.Item;
}

async function render(posterId: string) {
    let item = await getPosterItem(posterId) as PosterItem;

    // already rendered
    if (item.fullRenderKey && item.previewRenderKey) {
        return await getRenderUrls({
            fullRenderKey: item.fullRenderKey,
            previewRenderKey: item.previewRenderKey
        });
    }

    // save rendered image to s3
    // save thumbnail image to s3
    let saveData = item.posterJson;
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