import { HttpError } from "./errors";
import { isValidCustomSlug } from "./short-code";

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function assertValidUrl(url: unknown): string {
  if (typeof url !== "string" || !url.trim()) {
    throw new HttpError(400, "url is required and must be a non-empty string");
  }

  if (!isValidHttpUrl(url)) {
    throw new HttpError(400, "url must be a valid http or https URL");
  }

  return url.trim();
}

export function assertValidCustomSlugOrUndefined(
  customSlug: unknown
): string | undefined {
  if (customSlug === undefined) {
    return undefined;
  }

  if (typeof customSlug !== "string") {
    throw new HttpError(400, "customSlug must be a string");
  }

  if (!isValidCustomSlug(customSlug)) {
    throw new HttpError(
      400,
      "customSlug must match /^[A-Za-z0-9_-]{3,64}$/"
    );
  }

  return customSlug;
}

export function assertValidPasswordOrUndefined(
  password: unknown
): string | undefined {
  if (password === undefined) {
    return undefined;
  }

  if (typeof password !== "string") {
    throw new HttpError(400, "password must be a string");
  }

  if (!password.trim()) {
    throw new HttpError(400, "password cannot be empty");
  }

  if (password.length > 128) {
    throw new HttpError(400, "password cannot exceed 128 characters");
  }

  return password;
}

export function parseFutureExpiryOrUndefined(expiresAt: unknown): number | undefined {
  if (expiresAt === undefined) {
    return undefined;
  }

  if (typeof expiresAt !== "string") {
    throw new HttpError(400, "expiresAt must be an ISO date string");
  }

  const epochMs = Date.parse(expiresAt);
  if (Number.isNaN(epochMs)) {
    throw new HttpError(400, "expiresAt must be a valid ISO date string");
  }

  if (epochMs <= Date.now()) {
    throw new HttpError(400, "expiresAt must be in the future");
  }

  return Math.floor(epochMs / 1000);
}

export function parseFutureExpiryOrNull(expiresAt: unknown): number | null {
  if (expiresAt === null) {
    return null;
  }

  if (typeof expiresAt !== "string") {
    throw new HttpError(400, "expiresAt must be an ISO date string or null");
  }

  const epochMs = Date.parse(expiresAt);
  if (Number.isNaN(epochMs)) {
    throw new HttpError(400, "expiresAt must be a valid ISO date string");
  }

  if (epochMs <= Date.now()) {
    throw new HttpError(400, "expiresAt must be in the future");
  }

  return Math.floor(epochMs / 1000);
}

export function toIsoOrUndefined(epochSeconds?: number): string | undefined {
  if (!epochSeconds) {
    return undefined;
  }

  return new Date(epochSeconds * 1000).toISOString();
}
