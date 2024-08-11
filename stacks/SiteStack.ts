import {
  use,
  StaticSite,
  StackContext,
} from "sst/constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

import ApiStack from "./ApiStack";
import { rootCertArn } from "./Constants";

export default function SiteStack({ stack, app }: StackContext) {
  const { api } = use(ApiStack);

  const certificate = Certificate.fromCertificateArn(
    stack,
    "rootCert",
    rootCertArn
  );

  const designerSite = new StaticSite(stack, "designer-site", {
    path: "designer",
    buildCommand: "npm ci && npm run build",
    buildOutput: "dist",
    environment: {
      VITE_APP_API_URL: api.customDomainUrl || api.url,
    },
    customDomain: {
      domainName:
        app.stage === "prod"
          ? "designer.visualinkworks.com"
          : `${app.stage}-designer.visualinkworks.com`,
      hostedZone: "visualinkworks.com",
      cdk: {
        certificate: certificate,
      },
    },
  });

  stack.addOutputs({
    SiteUrl: designerSite.url,
    CustomDomainUrl: designerSite.customDomainUrl || "N/A",
  });

  return { designerSite };
}
