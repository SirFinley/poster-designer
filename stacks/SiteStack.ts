import {
  use,
  StaticSite,
  StackContext,
} from "sst/constructs";

import ApiStack from "./ApiStack";
import { rootDomain, getSiteDomain } from "./Config";

export default function SiteStack({ stack, app }: StackContext) {
  const { api } = use(ApiStack);

  const designerSite = new StaticSite(stack, "designer-site", {
    path: "designer",
    buildCommand: "npm ci && npm run build",
    buildOutput: "dist",
    environment: {
      VITE_APP_API_URL: api.customDomainUrl || api.url,
    },
    customDomain: {
      domainName: getSiteDomain(app.stage),
      hostedZone: rootDomain,
    },
  });

  stack.addOutputs({
    SiteUrl: designerSite.url,
    CustomDomainUrl: designerSite.customDomainUrl || "N/A",
  });

  return { designerSite };
}
