import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { HttpError, isConditionalCheckFailed } from "../shared/errors";
import { handleError, jsonResponse, redirectResponse } from "../shared/http";
import { getLink, incrementAnalytics } from "../shared/repository";
import { verifyPassword } from "../shared/security";

function isExpired(expiresAt?: number): boolean {
  if (!expiresAt) {
    return false;
  }

  return expiresAt <= Math.floor(Date.now() / 1000);
}

async function handleRedirect(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const shortCode = event.pathParameters?.shortCode;
  if (!shortCode) {
    throw new HttpError(400, "shortCode path parameter is required");
  }

  const link = await getLink(shortCode);
  if (!link) {
    throw new HttpError(404, "Link not found");
  }

  if (isExpired(link.expiresAt)) {
    throw new HttpError(410, "Link has expired");
  }

  if (link.passwordHash) {
    const password = event.queryStringParameters?.password;
    if (!password) {
      throw new HttpError(401, "Password is required for this link");
    }

    const isValid = await verifyPassword(password, link.passwordHash);
    if (!isValid) {
      throw new HttpError(401, "Invalid password");
    }
  }

  const accessedAt = new Date().toISOString();

  try {
    await incrementAnalytics(shortCode, accessedAt);
  } catch (error) {
    if (isConditionalCheckFailed(error)) {
      throw new HttpError(404, "Link not found");
    }
    throw error;
  }

  return redirectResponse(link.originalUrl);
}

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const method = event.requestContext.http.method.toUpperCase();
    if (method !== "GET") {
      return jsonResponse(405, { message: "Method not allowed" });
    }

    return await handleRedirect(event);
  } catch (error) {
    return handleError(error);
  }
}
