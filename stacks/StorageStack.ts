import { Bucket, StackContext, Table } from "@serverless-stack/resources";
import { Duration } from "aws-cdk-lib";
import { HttpMethods } from "aws-cdk-lib/aws-s3";

export default function StorageStack({ stack }: StackContext) {
  const countsTable = new Table(stack, "Counts", {
    fields: {
      name: "string",
      counts: "number",
    },
    primaryIndex: { partitionKey: "name" },
  });

  const postersTable = new Table(stack, "Posters", {
    fields: {
      id: "string",
      posterJson: "number",
    },
    primaryIndex: { partitionKey: "id" },
  });

  const uploadsBucket = new Bucket(stack, "Uploads", {
    cdk: {
      bucket: {
        cors: [
          {
            maxAge: 3000,
            allowedOrigins: ["*"],
            allowedHeaders: ["*"],
            allowedMethods: [HttpMethods.GET, HttpMethods.PUT],
          },
        ],
        lifecycleRules: [
          {
            enabled: true,
            id: "uploads-expiration",
            prefix: "uploads/",
            expiration: Duration.days(3),
          },
        ],
      },
    },
  });

  const thumbnailBucket = new Bucket(stack, "Thumbnails", {
    cdk: {
      bucket: {
        publicReadAccess: true,
        websiteIndexDocument: "index.html",
      },
    },
  });

  return {
    countsTable,
    postersTable,
    uploadsBucket,
    thumbnailBucket,
  };
}
