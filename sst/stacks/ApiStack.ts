import * as sst from "@serverless-stack/resources";
import { Bucket, Table } from "@serverless-stack/resources";

export default class ApiStack extends sst.Stack {
    // Public reference to the API
    api;

    constructor(scope: sst.App, id: string, props: EnvironmentVars) {
        super(scope, id, props);

        const { countsTable, postersTable, bucket } = props;

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