import ApiBuilder from 'claudia-api-builder';

const api = new ApiBuilder();
api.get('/', () => 'Hello world');

export = api;