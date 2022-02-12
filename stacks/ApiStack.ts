import * as sst from "@serverless-stack/resources";
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

import { rootCertArn } from './Constants';

const sharpLayerArn = 'arn:aws:lambda:us-east-1:606735259578:layer:sharp:1';

export default class ApiStack extends sst.Stack {
    // Public reference to the API
    api: sst.Api;

    constructor(scope: sst.App, id: string, props: ApiProps) {
        super(scope, id, props);

        const { countsTable, postersTable, bucket, thumbnailBucket } = props.config;
        const canvasLayer = LayerVersion.fromLayerVersionArn(this, "SharpLayer", sharpLayerArn);
        const certificate = Certificate.fromCertificateArn(this, "rootCert", rootCertArn);

        const apiDomain = 'api.visualinkworks.com';

        // Create the API
        this.api = new sst.Api(this, "Api", {
            cors: true,
            customDomain: {
                domainName: scope.stage === 'prod' ? apiDomain : `${scope.stage}-${apiDomain}`,
                hostedZone: 'visualinkworks.com',
                certificate,
            },
            defaultFunctionProps: {
                environment: {
                    COUNTS_TABLE_NAME: countsTable.tableName,
                    POSTERS_TABLE_NAME: postersTable.tableName,
                    BUCKET_NAME: bucket.bucketName,
                    THUMBNAIL_BUCKET_NAME: thumbnailBucket.bucketName,
                    THUMBNAIL_BUCKET_REGION: this.region,
                    REGION: this.region,
                },
            },
            routes: {
                "GET    /upload-image": "src/upload-image.main",
                "GET    /load-poster": "src/load-poster.main",
                "POST   /save-poster": "src/save-poster.main",
                "GET    /render-poster": {
                    function: {
                        handler: "src/render-poster.main",
                        timeout: 5 * 60,
                        bundle: { externalModules: ['sharp'] },
                        layers: [canvasLayer],
                        memorySize: 10240,
                    },
                },
            },
        });

        // Allow the API to access the table
        this.api.attachPermissions([countsTable]);
        this.api.attachPermissions([postersTable]);
        this.api.attachPermissions([bucket]);
        this.api.attachPermissions([thumbnailBucket]);

        // Show the API endpoint in the output
        this.addOutputs({
            ApiEndpoint: this.api.url,
            CustomDomainUrl: this.api.customDomainUrl || 'N/A',
        });
    }
}

interface ApiProps extends sst.StackProps {
    config: {
        countsTable: sst.Table,
        postersTable: sst.Table,
        bucket: sst.Bucket,
        thumbnailBucket: sst.Bucket,
    },
}