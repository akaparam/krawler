import { describe, expect, it, vi } from "vitest";
import { makeHttpEvent } from "../helpers/api-event";

const mocks = vi.hoisted(() => ({
  getLink: vi.fn(),
  incrementAnalytics: vi.fn(),
  verifyPassword: vi.fn()
}));

vi.mock("../../src/shared/repository", () => ({
  getLink: mocks.getLink,
  incrementAnalytics: mocks.incrementAnalytics
}));

vi.mock("../../src/shared/security", () => ({
  verifyPassword: mocks.verifyPassword
}));

import { handler } from "../../src/handlers/redirect";

describe("redirect happy path", () => {
  it("GET /{shortCode} returns 302 with location header", async () => {
    mocks.getLink.mockResolvedValue({
      PK: "LINK#abc123",
      SK: "METADATA",
      entityType: "LINK",
      shortCode: "abc123",
      originalUrl: "https://example.com",
      createdAt: "2026-04-19T10:00:00.000Z",
      clickCount: 12
    });
    mocks.incrementAnalytics.mockResolvedValue(undefined);

    const event = makeHttpEvent({
      method: "GET",
      path: "/abc123",
      pathParameters: { shortCode: "abc123" }
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(302);
    expect(response.headers?.location).toBe("https://example.com");
  });
});
