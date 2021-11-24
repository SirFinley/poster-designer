import * as sst from "@serverless-stack/resources";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { ViewerProtocolPolicy, AllowedMethods } from "@aws-cdk/aws-cloudfront";

export default class SiteStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props: SiteProps) {
    super(scope, id, props);

    const certificate = Certificate.fromCertificateArn(this, "rootCert", props.certArn);

    new sst.StaticSite(this, "designer-site", {
      path: "../designer/dist",
      environment: {
        APP_API_URL: props.config.appApiUrl,
      },
      customDomain: {
        domainName: scope.stage === 'prod' ? "designer.visualinkworks.com" : `${scope.stage}.visualinkworks.com`,
        hostedZone: 'visualinkworks.com',
        certificate: certificate,
      },
      cfDistribution: {
        defaultBehavior: {
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: AllowedMethods.ALLOW_ALL,
        }
      },
    });
  }
}

interface SiteProps extends sst.StackProps {
  certArn: string,
  config: {
    appApiUrl: string,
  },
}