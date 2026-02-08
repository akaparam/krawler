import type { APIGatewayProxyEventV2 } from "aws-lambda";

type EventInput = {
  method: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
};

export function makeHttpEvent(input: EventInput): APIGatewayProxyEventV2 {
  const {
    method,
    path,
    body,
    headers = {},
    pathParameters,
    queryStringParameters
  } = input;

  return {
    version: "2.0",
    routeKey: `${method.toUpperCase()} ${path}`,
    rawPath: path,
    rawQueryString: "",
    cookies: [],
    headers,
    queryStringParameters,
    requestContext: {
      accountId: "123456789012",
      apiId: "test-api",
      domainName: "test.execute-api.local",
      domainPrefix: "test",
      http: {
        method: method.toUpperCase(),
        path,
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "vitest"
      },
      requestId: "test-request-id",
      routeKey: `${method.toUpperCase()} ${path}`,
      stage: "$default",
      time: "01/Jan/2026:00:00:00 +0000",
      timeEpoch: 0
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    pathParameters,
    isBase64Encoded: false,
    stageVariables: undefined
  };
}
