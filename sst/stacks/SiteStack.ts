import * as sst from "@serverless-stack/resources";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { ViewerProtocolPolicy, AllowedMethods } from "@aws-cdk/aws-cloudfront";

const certArn = 'arn:aws:acm:us-east-1:606735259578:certificate/594527e2-48c0-4d89-8ac8-3c0f127339fb';

export default class SiteStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    new sst.StaticSite(this, "designer-site", {
      path: "../designer/dist",
      customDomain: {
        domainName: scope.stage === 'prod' ? "designer.visualinkworks.com" : `${scope.stage}.visualinkworks.com`,
        hostedZone: 'visualinkworks.com',
        certificate: Certificate.fromCertificateArn(this, "ViRootCert", certArn),
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