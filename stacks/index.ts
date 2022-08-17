import ApiStack from "./ApiStack";
import * as sst from "@serverless-stack/resources";
import StorageStack from "./StorageStack";
import SiteStack from "./SiteStack";

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x",
  });

  app
    .stack(StorageStack)
    .stack(ApiStack)
    .stack(SiteStack);
}
