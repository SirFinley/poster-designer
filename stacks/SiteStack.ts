import * as sst from "@serverless-stack/resources";
import { Certificate } from "@aws-cdk/aws-certificatemanager";

export default class SiteStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props: SiteProps) {
    super(scope, id, props);

    const certificate = Certificate.fromCertificateArn(this, "rootCert", props.certArn);

    const site = new sst.StaticSite(this, "designer-site", {
      path: "designer",
      buildOutput: "dist",
      buildCommand: "npm run build",
      environment: {
        APP_API_URL: props.config.appApiUrl,
      },
      customDomain: {
        domainName: scope.stage === 'prod' ? "designer.visualinkworks.com" : `${scope.stage}-designer.visualinkworks.com`,
        hostedZone: 'visualinkworks.com',
        certificate: certificate,
      },
    });

    this.addOutputs({
      SiteUrl: site.url,
      CustomDomainUrl: site.customDomainUrl || 'N/A',
    })
  }
}

interface SiteProps extends sst.StackProps {
  certArn: string,
  config: {
    appApiUrl: string,
  },
}