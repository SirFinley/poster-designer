import { LayerVersion } from '@aws-cdk/aws-lambda';
import * as sst from "@serverless-stack/resources";
import { Bucket, Table } from "@serverless-stack/resources";

const canvasLayerArn = 'arn:aws:lambda:us-east-1:676851479899:layer:canvas-nodejs:1';

export default class ApiStack extends sst.Stack {
    // Public reference to the API
    api;

    constructor(scope: sst.App, id: string, props: EnvironmentVars) {
        super(scope, id, props);

        const { countsTable, postersTable, bucket } = props;
        const canvasLayer = LayerVersion.fromLayerVersionArn(this, "CanvasLayer", canvasLayerArn);

        // Create the API
        this.api = new sst.Api(this, "Api", {
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