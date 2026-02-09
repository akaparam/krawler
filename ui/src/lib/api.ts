import type {
  ApiError,
  CreateLinkRequest,
  CreateLinkResponse,
  DailyStat,
  LinkMetadata,
  LinkStatsSummary,
  UpdateLinkRequest
} from "@/types/api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
  /\/+$/,
  ""
);

function resolveUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error("Missing VITE_API_BASE_URL. Set it in ui/.env");
  }

  return `${API_BASE_URL}${path}`;
}

async function requestJson<T>(
  path: string,
  options?: RequestInit,
  parseMode: "json" | "none" = "json"
): Promise<T> {
  const response = await fetch(resolveUrl(path), {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options?.headers ?? {})
    }
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const err = (await response.json()) as ApiError;
      if (typeof err.message === "string") {
        message = err.message;
      }
    } catch {
      // Ignore parse error and keep default message.
    }
    throw new Error(message);
  }

  if (parseMode === "none") {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getPublicShortLink(shortCode: string, password?: string): string {
  if (!API_BASE_URL) {
    return `/${shortCode}`;
  }

  if (!password) {
    return `${API_BASE_URL}/${shortCode}`;
  }

  const query = new URLSearchParams({ password });
  return `${API_BASE_URL}/${shortCode}?${query.toString()}`;
}

export async function createLink(payload: CreateLinkRequest): Promise<CreateLinkResponse> {
  return requestJson<CreateLinkResponse>("/links", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getLinkMetadata(shortCode: string): Promise<LinkMetadata> {
  return requestJson<LinkMetadata>(`/links/${encodeURIComponent(shortCode)}`, {
    method: "GET"
  });
}

export async function updateLink(
  shortCode: string,
  payload: UpdateLinkRequest
): Promise<LinkMetadata> {
  return requestJson<LinkMetadata>(`/links/${encodeURIComponent(shortCode)}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function getLinkStatsSummary(shortCode: string): Promise<LinkStatsSummary> {
  return requestJson<LinkStatsSummary>(
    `/links/${encodeURIComponent(shortCode)}/stats`,
    {
      method: "GET"
    }
  );
}

export async function getLinkStatsDaily(shortCode: string): Promise<DailyStat[]> {
  return requestJson<DailyStat[]>(`/links/${encodeURIComponent(shortCode)}/stats/daily`, {
    method: "GET"
  });
}

export async function deleteLink(shortCode: string): Promise<void> {
  return requestJson<void>(
    `/links/${encodeURIComponent(shortCode)}`,
    {
      method: "DELETE"
    },
    "none"
  );
}
