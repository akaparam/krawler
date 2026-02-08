import { HttpError } from "./errors";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new HttpError(500, `${name} environment variable is required`);
  }
  return value;
}

export const TABLE_NAME = requireEnv("TABLE_NAME");
export const BASE_URL = process.env.BASE_URL?.replace(/\/+$/, "");
