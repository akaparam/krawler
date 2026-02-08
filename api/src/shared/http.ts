import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
} from "aws-lambda";
import { HttpError } from "./errors";

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store"
};

export function jsonResponse(
  statusCode: number,
  payload: unknown
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
  };
}

export function noContentResponse(): APIGatewayProxyResultV2 {
  return {
    statusCode: 204,
    headers: {
      "cache-control": "no-store"
    }
  };
}

export function redirectResponse(url: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 302,
    headers: {
      location: url,
      "cache-control": "no-store"
    }
  };
}

export function parseJsonBody<T>(event: APIGatewayProxyEventV2): T {
  if (!event.body) {
    throw new HttpError(400, "Request body is required");
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf-8")
    : event.body;

  try {
    return JSON.parse(rawBody) as T;
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
}

export function handleError(error: unknown): APIGatewayProxyResultV2 {
  if (error instanceof HttpError) {
    return jsonResponse(error.statusCode, { message: error.message });
  }

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";
  console.error("Unhandled error", error);
  return jsonResponse(500, { message });
}
