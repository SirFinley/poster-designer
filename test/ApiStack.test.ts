import * as sst from "@serverless-stack/resources";
import ApiStack from "../stacks/ApiStack";
import StorageStack from "../stacks/StorageStack";

test("Test ApiStack - stage:prod", () => {
    const app = new sst.App({
        stage: 'prod'
    });
    const storageStack = new StorageStack(app, 'storage-stack');

    // WHEN
    const stack = new ApiStack(app, "test-stack", {
        config: {
            bucket: storageStack.bucket,
            countsTable: storageStack.countsTable,
            postersTable: storageStack.postersTable,
        }
    });

    // THEN
    expect(stack.api.customDomainUrl).toEqual('https://api.visualinkworks.com');
});

test("Test ApiStack - stage:dev", () => {
    const app = new sst.App({
        stage: 'dev'
    });
    const storageStack = new StorageStack(app, 'storage-stack');

    // WHEN
    const stack = new ApiStack(app, "test-stack", {
        config: {
            bucket: storageStack.bucket,
            countsTable: storageStack.countsTable,
            postersTable: storageStack.postersTable,
        }
    });

    // THEN
    expect(stack.api.customDomainUrl).toEqual('https://dev-api.visualinkworks.com');
});