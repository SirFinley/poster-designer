import {
  DeleteCommandInput,
  DynamoDBDocument,
  GetCommandInput,
  PutCommandInput,
  QueryCommandInput,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";

import { DynamoDB } from "@aws-sdk/client-dynamodb";

const client = DynamoDBDocument.from(new DynamoDB());

export default {
  get: (params: GetCommandInput) => client.get(params),
  put: (params: PutCommandInput) => client.put(params),
  query: (params: QueryCommandInput) => client.query(params),
  update: (params: UpdateCommandInput) => client.update(params),
  delete: (params: DeleteCommandInput) => client.delete(params),
};