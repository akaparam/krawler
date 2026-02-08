import { describe, expect, it, vi } from "vitest";
import { makeHttpEvent } from "../helpers/api-event";

const mocks = vi.hoisted(() => ({
  getLink: vi.fn(),
  getDailyStats: vi.fn()
}));

vi.mock("../../src/shared/repository", () => ({
  getLink: mocks.getLink,
  getDailyStats: mocks.getDailyStats
}));

import { handler } from "../../src/handlers/stats";

describe("stats happy paths", () => {
  it("GET /links/{shortCode}/stats returns summary", async () => {
    mocks.getLink.mockResolvedValue({
      PK: "LINK#abc123",
      SK: "METADATA",
      entityType: "LINK",
      shortCode: "abc123",
      originalUrl: "https://example.com",
      createdAt: "2026-04-19T10:00:00.000Z",
      clickCount: 42,
      lastAccessedAt: "2026-04-19T11:00:00.000Z"
    });

    const event = makeHttpEvent({
      method: "GET",
      path: "/links/abc123/stats",
      pathParameters: { shortCode: "abc123" }
    });

    const response = await handler(event);
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(String(response.body));
    expect(body).toEqual({
      clickCount: 42,
      lastAccessedAt: "2026-04-19T11:00:00.000Z"
    });
  });

  it("GET /links/{shortCode}/stats/daily returns daily aggregation", async () => {
    mocks.getLink.mockResolvedValue({
      PK: "LINK#abc123",
      SK: "METADATA",
      entityType: "LINK",
      shortCode: "abc123",
      originalUrl: "https://example.com",
      createdAt: "2026-04-19T10:00:00.000Z",
      clickCount: 42
    });
    mocks.getDailyStats.mockResolvedValue([
      { date: "2026-04-19", count: 12 },
      { date: "2026-04-18", count: 30 }
    ]);

    const event = makeHttpEvent({
      method: "GET",
      path: "/links/abc123/stats/daily",
      pathParameters: { shortCode: "abc123" }
    });

    const response = await handler(event);
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(String(response.body));
    expect(body).toEqual([
      { date: "2026-04-18", count: 30 },
      { date: "2026-04-19", count: 12 }
    ]);
  });
});
