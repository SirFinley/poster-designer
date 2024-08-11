import { APIGatewayProxyEventV2 } from "aws-lambda";

export default function handler<T>(lambda: ApiLambda<T>) {
  return async function (event: APIGatewayProxyEventV2) {
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
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  };
}

type ApiLambda<T> = (event: APIGatewayProxyEventV2) => Promise<T>;