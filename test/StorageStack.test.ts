import { Template } from "aws-cdk-lib/assertions";
import { App, getStack } from "@serverless-stack/resources";
import { test } from "vitest";

import StorageStack from "../stacks/StorageStack";

test("Test StorageStack", () => {
  const app = new App();

  app.stack(StorageStack);

  // THEN
  const template = Template.fromStack(getStack(StorageStack));
  template.hasResourceProperties("AWS::DynamoDB::Table", {
    BillingMode: "PAY_PER_REQUEST",
    TableName: "Counts",
  });
  template.hasResourceProperties("AWS::DynamoDB::Table", {
    BillingMode: "PAY_PER_REQUEST",
    TableName: "Posters",
  });
  template.hasResourceProperties("AWS::DynamoDB::Bucket", {
    BillingMode: "PAY_PER_REQUEST",
    BucketName: "Uploads"
  });
  template.hasResourceProperties("AWS::DynamoDB::Bucket", {
    BillingMode: "PAY_PER_REQUEST",
    TableName: "Thumbnails",
  });
});
