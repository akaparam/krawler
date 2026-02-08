import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(nodeScrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, 32)) as Buffer;
  return `${salt.toString("base64")}:${derivedKey.toString("base64")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [saltB64, hashB64] = storedHash.split(":");
  if (!saltB64 || !hashB64) {
    return false;
  }

  const salt = Buffer.from(saltB64, "base64");
  const expectedHash = Buffer.from(hashB64, "base64");
  const calculatedHash = (await scrypt(password, salt, 32)) as Buffer;

  if (expectedHash.length !== calculatedHash.length) {
    return false;
  }

  return timingSafeEqual(expectedHash, calculatedHash);
}
