import { randomBytes } from "crypto";

const BASE62_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const DEFAULT_LENGTH = 6;

const CUSTOM_SLUG_REGEX = /^[A-Za-z0-9_-]{3,64}$/;

export function generateShortCode(length = DEFAULT_LENGTH): string {
  const bytes = randomBytes(length);
  let output = "";

  for (let index = 0; index < length; index += 1) {
    output += BASE62_ALPHABET[bytes[index] % BASE62_ALPHABET.length];
  }

  return output;
}

export function isValidCustomSlug(slug: string): boolean {
  return CUSTOM_SLUG_REGEX.test(slug);
}
