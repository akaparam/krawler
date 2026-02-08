import { describe, expect, it } from "vitest";

const baseUrl = process.env.E2E_BASE_URL;
const describeE2E = baseUrl ? describe.sequential : describe.skip;
const REQUEST_TIMEOUT_MS = 20000;

type JsonObject = Record<string, unknown>;

type ApiResponse = {
  status: number;
  headers: Headers;
  body: JsonObject | JsonObject[] | null;
  rawBody: string;
};

async function requestApi(
  method: string,
  path: string,
  payload?: unknown
): Promise<ApiResponse> {
  if (!baseUrl) {
    throw new Error("E2E_BASE_URL is required");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "content-type": "application/json"
      },
      body: payload === undefined ? undefined : JSON.stringify(payload),
      redirect: "manual",
      signal: controller.signal
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error(
        `Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${method} ${path}`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const rawBody = await response.text();
  let body: JsonObject | JsonObject[] | null = null;

  if (rawBody) {
    try {
      body = JSON.parse(rawBody) as JsonObject | JsonObject[];
    } catch {
      body = null;
    }
  }

  return {
    status: response.status,
    headers: response.headers,
    body,
    rawBody
  };
}

describeE2E("url shortener e2e flow", () => {
  it(
    "runs full API lifecycle through HTTP endpoints",
    async () => {
    const slug = `e2e${Date.now().toString(36)}`;
    const originalUrl = "https://example.com/frontend-flow";
    const password = "secret123";
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const create = await requestApi("POST", "/links", {
      url: originalUrl,
      customSlug: slug,
      expiresAt,
      password
    });
    expect(create.status).toBe(201);
    expect(create.body).toMatchObject({
      shortCode: slug
    });

    const metadataBefore = await requestApi("GET", `/links/${slug}`);
    expect(metadataBefore.status).toBe(200);
    expect(metadataBefore.body).toMatchObject({
      shortCode: slug,
      originalUrl,
      isPasswordProtected: true
    });

    const redirectWithPassword = await requestApi(
      "GET",
      `/${slug}?password=${encodeURIComponent(password)}`
    );
    expect(redirectWithPassword.status).toBe(302);
    expect(redirectWithPassword.headers.get("location")).toBe(originalUrl);

    const statsSummary = await requestApi("GET", `/links/${slug}/stats`);
    expect(statsSummary.status).toBe(200);
    expect(statsSummary.body).toMatchObject({
      clickCount: expect.any(Number)
    });

    const summaryBody = statsSummary.body as JsonObject;
    expect(Number(summaryBody.clickCount)).toBeGreaterThanOrEqual(1);

    const statsDaily = await requestApi("GET", `/links/${slug}/stats/daily`);
    expect(statsDaily.status).toBe(200);
    expect(Array.isArray(statsDaily.body)).toBe(true);
    const today = new Date().toISOString().slice(0, 10);
    const dailyRows = statsDaily.body as JsonObject[];
    const todayRow = dailyRows.find((row) => row.date === today);
    expect(todayRow).toBeDefined();
    expect(Number((todayRow as JsonObject).count)).toBeGreaterThanOrEqual(1);

    const patch = await requestApi("PATCH", `/links/${slug}`, {
      removePassword: true
    });
    expect(patch.status).toBe(200);
    expect(patch.body).toMatchObject({
      shortCode: slug,
      isPasswordProtected: false
    });

    const redirectWithoutPassword = await requestApi("GET", `/${slug}`);
    expect(redirectWithoutPassword.status).toBe(302);
    expect(redirectWithoutPassword.headers.get("location")).toBe(originalUrl);

    const del = await requestApi("DELETE", `/links/${slug}`);
    expect(del.status).toBe(204);

    const metadataAfterDelete = await requestApi("GET", `/links/${slug}`);
    expect(metadataAfterDelete.status).toBe(404);
    },
    120000
  );
});
