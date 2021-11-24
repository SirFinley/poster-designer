import ApiStack from "./ApiStack";
import * as sst from "@serverless-stack/resources";
import StorageStack from "./StorageStack";
import SiteStack from "./SiteStack";

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x"
  });

  const storageStack = new StorageStack(app, "storage");
  new ApiStack(app, "designer-api", {
    countsTable: storageStack.countsTable,
    postersTable: storageStack.postersTable,
    bucket: storageStack.bucket,
  });

  // new SiteStack(app, "designer-site");

  // Add more stacks
}
