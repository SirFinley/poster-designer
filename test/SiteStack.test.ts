import { Template } from "aws-cdk-lib/assertions";
import { App, getStack } from "sst/constructs";
import {test} from "vitest";

import SiteStack from "../stacks/SiteStack";

test("Test ApiStack - stage:prod", () => {
    // const app = new App({
    //     stage: 'prod'
    // });

    // // WHEN
    // const stack = new SiteStack(app, "test-stack", {
    //     config_appApiUrl: 'https://api.visualinkworks.com',
    // });

    // // THEN
    // expect(stack.designerSite.customDomainUrl).toEqual('https://designer.visualinkworks.com');
});

test("Test ApiStack - stage:dev", () => {
    // const app = new App({
    //     stage: 'dev'
    // });

    // // WHEN
    // const stack = new SiteStack(app, "test-stack", {
    //     config_appApiUrl: 'https://dev-api.visualinkworks.com',
    // });

    // // THEN
    // expect(stack.designerSite.customDomainUrl).toEqual('https://dev-designer.visualinkworks.com');
});