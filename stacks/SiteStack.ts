import * as sst from "@serverless-stack/resources";
import { Certificate } from "@aws-cdk/aws-certificatemanager";

import { rootCertArn } from './Constants';

export default class SiteStack extends sst.Stack {
  designerSite: sst.StaticSite;

  constructor(scope: sst.App, id: string, props: SiteProps) {
    super(scope, id, props);

    const certificate = Certificate.fromCertificateArn(this, "rootCert", rootCertArn);

    this.designerSite = new sst.ReactStaticSite(this, "designer-site", {
      path: "designer",
      buildCommand: "npm ci && npm run build",
      environment: {
        REACT_APP_API_URL: props.config_appApiUrl,
      },
      customDomain: {
        domainName: scope.stage === 'prod' ? "designer.visualinkworks.com" : `${scope.stage}-designer.visualinkworks.com`,
        hostedZone: 'visualinkworks.com',
        certificate: certificate,
      },
    });

    this.addOutputs({
      SiteUrl: this.designerSite.url,
      CustomDomainUrl: this.designerSite.customDomainUrl || 'N/A',
    })
  }
}

interface SiteProps extends sst.StackProps {
  config_appApiUrl: string,
}