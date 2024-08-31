# About

[Demo here](https://designer.visualinkworks.com)

Intended as part of a poster printing business where users would be able to upload and edit a poster for printing. Once they finish designing their poster they would save it and get assigned a poster id that they can send to us on their Etsy purchase or automatically saved and associated to their purchase on shopify site.

There are multiple parts to this project listed below.

- [Poster Designer Frontend](./designer/README.md) - React frontend to upload and design poster.
- [Poster Designer Backend](./sst.config.ts) - [SST (Serverless Stack)](https://serverless-stack.com) on AWS to handle image uploads, site hosting, saving posters
- [Poster Manager](./manager/README.md) - Local C# app to render a poster for printing given a poster id.


## Setup

Start by installing the dependencies.

```bash
$ npm install
```

Set up Sharp layer for lambda - https://docs.sst.dev/advanced/lambda-layers

Configure the domain to use at [Config.ts::rootDomain](./stacks/Config.ts#L1)

## Commands

Commands below default to 'dev' stage. To run for other stages, see actual commands in [package.json](./package.json) and run with desired --stage argument.

### `npm run start`

Starts the local Lambda development environment.

### `npm run build`

Build your app and synthesize your stacks.

### `npm run deploy [stack]`

Deploy all your stacks to AWS. Or optionally deploy a specific stack.

### `npm run remove [stack]`

Remove all your stacks and all of their resources from AWS. Or optionally remove a specific stack.
