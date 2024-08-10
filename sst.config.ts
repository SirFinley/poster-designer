import type { SSTConfig } from "sst"
import ApiStack from "./stacks/ApiStack";
import StorageStack from "./stacks/StorageStack";
import SiteStack from "./stacks/SiteStack";


export default {
  config(input) {
    return {
      name: "poster-designer",
      region: "us-east-1",
      profile: "poster-designer"
    }
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: "nodejs18.x"
      // runtime: "nodejs18.x",
      // architecture: "arm_64",
    })

    app
      .stack(StorageStack)
      .stack(ApiStack)
      .stack(SiteStack)
  },
} satisfies SSTConfig
