import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { HttpError } from "../shared/errors";
import { handleError, jsonResponse } from "../shared/http";
import { getDailyStats, getLink } from "../shared/repository";

async function getStatsSummary(
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

  return jsonResponse(200, {
    clickCount: link.clickCount ?? 0,
    lastAccessedAt: link.lastAccessedAt ?? null
  });
}

async function getStatsDaily(
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

  const stats = await getDailyStats(shortCode);
  const response = stats
    .map((item) => ({
      date: item.date,
      count: item.count ?? 0
    }))
    .sort((left, right) => left.date.localeCompare(right.date));

  return jsonResponse(200, response);
}

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const method = event.requestContext.http.method.toUpperCase();
    if (method !== "GET") {
      return jsonResponse(405, { message: "Method not allowed" });
    }

    const path = event.rawPath;
    if (path.endsWith("/stats/daily")) {
      return await getStatsDaily(event);
    }

    if (path.endsWith("/stats")) {
      return await getStatsSummary(event);
    }

    return jsonResponse(404, { message: "Route not found" });
  } catch (error) {
    return handleError(error);
  }
}
