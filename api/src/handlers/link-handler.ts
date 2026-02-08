import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { BASE_URL } from "../shared/config";
import { HttpError } from "../shared/errors";
import { handleError, jsonResponse, noContentResponse, parseJsonBody } from "../shared/http";
import { linkPk, metadataSk } from "../shared/keys";
import type { LinkItem } from "../shared/models";
import { deleteLinkWithStats, getLink, patchLink, tryCreateLink } from "../shared/repository";
import { hashPassword } from "../shared/security";
import { generateShortCode } from "../shared/short-code";
import {
  assertValidCustomSlugOrUndefined,
  assertValidPasswordOrUndefined,
  assertValidUrl,
  parseFutureExpiryOrNull,
  parseFutureExpiryOrUndefined,
  toIsoOrUndefined
} from "../shared/validation";

type CreateLinkRequest = {
  url?: unknown;
  customSlug?: unknown;
  expiresAt?: unknown;
  password?: unknown;
};

type PatchLinkRequest = {
  expiresAt?: unknown;
  password?: unknown;
  removePassword?: unknown;
};

type LinkMetadataResponse = {
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string;
  isPasswordProtected: boolean;
  clickCount: number;
  lastAccessedAt?: string;
};

function linkToResponse(link: LinkItem): LinkMetadataResponse {
  return {
    shortCode: link.shortCode,
    originalUrl: link.originalUrl,
    createdAt: link.createdAt,
    expiresAt: toIsoOrUndefined(link.expiresAt),
    isPasswordProtected: Boolean(link.passwordHash),
    clickCount: link.clickCount ?? 0,
    lastAccessedAt: link.lastAccessedAt
  };
}

function readHeader(
  headers: Record<string, string | undefined> | undefined,
  key: string
): string | undefined {
  if (!headers) {
    return undefined;
  }

  return headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()];
}

function buildShortUrl(event: APIGatewayProxyEventV2, shortCode: string): string {
  if (BASE_URL) {
    return `${BASE_URL}/${shortCode}`;
  }

  const host = readHeader(event.headers, "x-forwarded-host") ?? readHeader(event.headers, "host");
  const protocol = readHeader(event.headers, "x-forwarded-proto") ?? "https";

  if (!host) {
    return `/${shortCode}`;
  }

  return `${protocol}://${host}/${shortCode}`;
}

async function createLink(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const body = parseJsonBody<CreateLinkRequest>(event);
  const originalUrl = assertValidUrl(body.url);
  const customSlug = assertValidCustomSlugOrUndefined(body.customSlug);
  const expiresAt = parseFutureExpiryOrUndefined(body.expiresAt);
  const password = assertValidPasswordOrUndefined(body.password);
  const now = new Date().toISOString();
  const passwordHash = password ? await hashPassword(password) : undefined;

  if (customSlug) {
    const link: LinkItem = {
      PK: linkPk(customSlug),
      SK: metadataSk,
      entityType: "LINK",
      shortCode: customSlug,
      originalUrl,
      createdAt: now,
      expiresAt,
      passwordHash,
      clickCount: 0
    };

    const created = await tryCreateLink(link);
    if (!created) {
      throw new HttpError(409, "customSlug already exists");
    }

    return jsonResponse(201, {
      shortCode: customSlug,
      shortUrl: buildShortUrl(event, customSlug)
    });
  }

  const maxAttempts = 25;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const length = attempt > 15 ? 8 : attempt > 7 ? 7 : 6;
    const shortCode = generateShortCode(length);
    const link: LinkItem = {
      PK: linkPk(shortCode),
      SK: metadataSk,
      entityType: "LINK",
      shortCode,
      originalUrl,
      createdAt: now,
      expiresAt,
      passwordHash,
      clickCount: 0
    };

    const created = await tryCreateLink(link);
    if (created) {
      return jsonResponse(201, {
        shortCode,
        shortUrl: buildShortUrl(event, shortCode)
      });
    }
  }

  throw new HttpError(500, "Failed to generate a unique short code");
}

async function getLinkMetadata(
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

  return jsonResponse(200, linkToResponse(link));
}

async function updateLink(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const shortCode = event.pathParameters?.shortCode;
  if (!shortCode) {
    throw new HttpError(400, "shortCode path parameter is required");
  }

  const body = parseJsonBody<PatchLinkRequest>(event);
  const hasExpiresAt = Object.prototype.hasOwnProperty.call(body, "expiresAt");
  const hasPassword = Object.prototype.hasOwnProperty.call(body, "password");
  const hasRemovePassword = Object.prototype.hasOwnProperty.call(body, "removePassword");

  if (!hasExpiresAt && !hasPassword && !hasRemovePassword) {
    throw new HttpError(
      400,
      "Request must contain at least one of: expiresAt, password, removePassword"
    );
  }

  if (hasRemovePassword && typeof body.removePassword !== "boolean") {
    throw new HttpError(400, "removePassword must be a boolean");
  }

  if (body.removePassword && hasPassword) {
    throw new HttpError(400, "Cannot set password and removePassword=true in same request");
  }

  const patch: {
    expiresAt?: number | null;
    passwordHash?: string;
    removePassword?: boolean;
  } = {};

  if (hasExpiresAt) {
    patch.expiresAt = parseFutureExpiryOrNull(body.expiresAt);
  }

  if (hasPassword) {
    const password = assertValidPasswordOrUndefined(body.password);
    if (!password) {
      throw new HttpError(400, "password cannot be empty");
    }
    patch.passwordHash = await hashPassword(password);
  }

  if (body.removePassword === true) {
    patch.removePassword = true;
  }

  if (
    patch.expiresAt === undefined &&
    patch.passwordHash === undefined &&
    !patch.removePassword
  ) {
    throw new HttpError(400, "No effective updates were provided");
  }

  const updated = await patchLink(shortCode, patch);
  if (!updated) {
    throw new HttpError(404, "Link not found");
  }

  return jsonResponse(200, linkToResponse(updated));
}

async function deleteLink(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const shortCode = event.pathParameters?.shortCode;
  if (!shortCode) {
    throw new HttpError(400, "shortCode path parameter is required");
  }

  const deleted = await deleteLinkWithStats(shortCode);
  if (!deleted) {
    throw new HttpError(404, "Link not found");
  }

  return noContentResponse();
}

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const method = event.requestContext.http.method.toUpperCase();
    const path = event.rawPath;

    if (method === "POST" && path === "/links") {
      return await createLink(event);
    }

    if (method === "GET" && path.startsWith("/links/")) {
      return await getLinkMetadata(event);
    }

    if (method === "PATCH" && path.startsWith("/links/")) {
      return await updateLink(event);
    }

    if (method === "DELETE" && path.startsWith("/links/")) {
      return await deleteLink(event);
    }

    return jsonResponse(404, { message: "Route not found" });
  } catch (error) {
    return handleError(error);
  }
}
