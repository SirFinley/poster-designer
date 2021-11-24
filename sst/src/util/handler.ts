import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2, Context } from "aws-lambda";

export default function handler(lambda: ApiLambda) {
  return async function (event: APIGatewayProxyEventV2, context: Context) {
    let body, statusCode;

    try {
      // Run the Lambda
      body = await lambda(event);
      statusCode = 200;
    } catch (e) {
      const error = e as Error;
      console.error(error);
      body = { error: error.message };
      statusCode = 500;
    }

    // Return HTTP response
    return {
      statusCode,
      body: JSON.stringify(body),
    };
  };
}

type ApiLambda = (event: APIGatewayProxyEventV2) => Promise<any>;