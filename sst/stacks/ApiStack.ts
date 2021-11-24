import { LayerVersion } from '@aws-cdk/aws-lambda';
import * as sst from "@serverless-stack/resources";
import { Bucket, Table } from "@serverless-stack/resources";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { CorsHttpMethod } from "@aws-cdk/aws-apigatewayv2";

const canvasLayerArn = 'arn:aws:lambda:us-east-1:606735259578:layer:canvas-nodejs:1';
const certArn = 'arn:aws:acm:us-east-1:606735259578:certificate/594527e2-48c0-4d89-8ac8-3c0f127339fb';

export default class ApiStack extends sst.Stack {
    // Public reference to the API
    api;

    constructor(scope: sst.App, id: string, props: EnvironmentVars) {
        super(scope, id, props);

        const { countsTable, postersTable, bucket } = props;
        const canvasLayer = LayerVersion.fromLayerVersionArn(this, "CanvasLayer", canvasLayerArn);

        // Create the API
        this.api = new sst.Api(this, "Api", {
            cors: {
                allowMethods: [CorsHttpMethod.ANY],
            },
            customDomain: {
                domainName: 'api.visualinkworks.com',
                hostedZone: 'visualinkworks.com',
                certificate: Certificate.fromCertificateArn(this, "ApiCert", certArn),
            },
            defaultFunctionProps: {
                environment: {
                    COUNTS_TABLE_NAME: countsTable.tableName,
                    POSTERS_TABLE_NAME: postersTable.tableName,
                    BUCKET_NAME: bucket.bucketName,
                    REGION: this.region,
                },
            },
            routes: {
                "GET    /upload-image": "src/upload-image.main",
                "POST   /save-poster": "src/save-poster.main",
                "GET    /render-poster": {
                    function: {
                        handler: "src/render-poster.main",
                        timeout: 5 * 60,
                        bundle: { externalModules: ['canvas'] },
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

        // Show the API endpoint in the output
        this.addOutputs({
            ApiEndpoint: this.api.url,
        });
    }
}

interface EnvironmentVars extends sst.StackProps {
    countsTable: Table,
    postersTable: Table,
    bucket: Bucket,
}