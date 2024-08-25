import { Api, StackContext, use } from "sst/constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

import { rootDomain } from "./Constants";
import StorageStack from "./StorageStack";

export default function ApiStack({ stack, app }: StackContext) {
  const { countsTable, postersTable, uploadsBucket, thumbnailBucket } =
    use(StorageStack);

  const apiDomain = `api.${rootDomain}`;

  // Create the API
  const api = new Api(stack, "Api", {
    cors: true,
    customDomain: {
      domainName:
        app.stage === "prod" ? apiDomain : `${app.stage}-${apiDomain}`,
      hostedZone: rootDomain,
    },

    defaults: {
      function: {
        environment: {
          COUNTS_TABLE_NAME: countsTable.tableName,
          POSTERS_TABLE_NAME: postersTable.tableName,
          BUCKET_NAME: uploadsBucket.bucketName,
          THUMBNAIL_BUCKET_NAME: thumbnailBucket.bucketName,
          THUMBNAIL_BUCKET_REGION: stack.region,
          REGION: stack.region,
        },
      },
    },
    routes: {
      "GET    /upload-image": "packages/functions/src/upload-image.main",
      "GET    /load-poster": "packages/functions/src/load-poster.main",
      "POST   /save-poster": "packages/functions/src/save-poster.main",
      "GET    /render-poster": {
        function: {
          handler: "packages/functions/src/render-poster.main",
          timeout: 5 * 60,
          bundle: { externalModules: ["sharp"] },
          layers: [
            new lambda.LayerVersion(stack, "SharpLayer", {
              code: lambda.Code.fromAsset("layers/sharp"),
            })
          ],
          memorySize: 10240,
        },
      },
    },
  });

  // Allow the API to access the table
  api.attachPermissions([countsTable]);
  api.attachPermissions([postersTable]);
  api.attachPermissions([uploadsBucket]);
  api.attachPermissions([thumbnailBucket]);

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
    CustomDomainUrl: api.customDomainUrl || "N/A",
  });

  return { api };
}
