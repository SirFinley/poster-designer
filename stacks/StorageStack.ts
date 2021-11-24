import * as sst from "@serverless-stack/resources";

export default class StorageStack extends sst.Stack {
    // Public reference to the table
    countsTable;
    postersTable;
    bucket;

    constructor(scope: sst.App, id: string, props?: sst.StackProps) {
        super(scope, id, props);

        // Create the DynamoDB table
        this.countsTable = new sst.Table(this, "Counts", {
            fields: {
                name: sst.TableFieldType.STRING,
                counts: sst.TableFieldType.NUMBER,
            },
            primaryIndex: { partitionKey: "name" },
        });

        // Create the DynamoDB table
        this.postersTable = new sst.Table(this, "Posters", {
            fields: {
                id: sst.TableFieldType.STRING,
                posterJson: sst.TableFieldType.NUMBER,
            },
            primaryIndex: { partitionKey: "id" },
        });

        this.bucket = new sst.Bucket(this, "Uploads");
    }
}