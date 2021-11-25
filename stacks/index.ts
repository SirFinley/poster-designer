import ApiStack from "./ApiStack";
import * as sst from "@serverless-stack/resources";
import StorageStack from "./StorageStack";
import SiteStack from "./SiteStack";

const certArn = 'arn:aws:acm:us-east-1:606735259578:certificate/594527e2-48c0-4d89-8ac8-3c0f127339fb';

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x"
  });

  const storageStack = new StorageStack(app, "storage");
  const apiStack = new ApiStack(app, "designer-api", {
    config: {
      countsTable: storageStack.countsTable,
      postersTable: storageStack.postersTable,
      bucket: storageStack.bucket,
    },
    certArn,
  });

  new SiteStack(app, "designer-site", {
    certArn,
    config: {
      appApiUrl: apiStack.api.customDomainUrl || apiStack.api.url,
    },
  });

  // Add more stacks
}
