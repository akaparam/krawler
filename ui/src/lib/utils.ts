import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) {
    return "-";
  }

  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

export function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) {
    return false;
  }
  const expiry = Date.parse(expiresAt);
  if (Number.isNaN(expiry)) {
    return false;
  }
  return expiry < Date.now();
}

export function getStatusLabel(input: {
  expiresAt?: string;
  isPasswordProtected?: boolean;
}): "active" | "expired" | "protected" {
  if (isExpired(input.expiresAt)) {
    return "expired";
  }
  if (input.isPasswordProtected) {
    return "protected";
  }
  return "active";
}
