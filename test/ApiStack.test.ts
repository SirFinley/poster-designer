import { App, getStack } from "@serverless-stack/resources";
import { Template } from "aws-cdk-lib/assertions";
import {test} from "vitest";

import ApiStack from "../stacks/ApiStack";

test("Test ApiStack - stage:prod", () => {
    const app = new App({
        stage: 'prod'
    });
    
    app.stack(ApiStack);

    // const template = Template.fromStack(getStack(ApiStack));
    // template.hasResourceProperties("AWS::DynamoDB::Table", {
    //     TableName: "Counts",
    // });

    // WHEN
    // const stack = new ApiStack(app, "test-stack", {
    //     config: {
    //         uploadsBucket: storageStack.uploadsBbucket,
    //         countsTable: storageStack.countsTable,
    //         postersTable: storageStack.postersTable,
    //         thumbnailBucket: storageStack.thumbnailBucket,
    //     }
    // });

    // THEN
    // expect(stack.api.customDomainUrl).toEqual('https://api.visualinkworks.com');
});

test("Test ApiStack - stage:dev", () => {
//     const app = new sst.App({
//         stage: 'dev'
//     });
//     const storageStack = new StorageStack(app, 'storage-stack');

//     // WHEN
//     const stack = new ApiStack(app, "test-stack", {
//         config: {
//             uploadsBucket: storageStack.uploadsBbucket,
//             countsTable: storageStack.countsTable,
//             postersTable: storageStack.postersTable,
//             thumbnailBucket: storageStack.thumbnailBucket,
//         }
//     });

//     // THEN
//     expect(stack.api.customDomainUrl).toEqual('https://dev-api.visualinkworks.com');
});