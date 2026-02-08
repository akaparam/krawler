import { describe, expect, it, vi } from "vitest";
import { makeHttpEvent } from "../helpers/api-event";

const mocks = vi.hoisted(() => ({
  tryCreateLink: vi.fn(),
  getLink: vi.fn(),
  patchLink: vi.fn(),
  deleteLinkWithStats: vi.fn(),
  hashPassword: vi.fn(),
  generateShortCode: vi.fn()
}));

vi.mock("../../src/shared/config", () => ({
  BASE_URL: "https://sho.rt"
}));

vi.mock("../../src/shared/repository", () => ({
  tryCreateLink: mocks.tryCreateLink,
  getLink: mocks.getLink,
  patchLink: mocks.patchLink,
  deleteLinkWithStats: mocks.deleteLinkWithStats
}));

vi.mock("../../src/shared/security", () => ({
  hashPassword: mocks.hashPassword
}));

vi.mock("../../src/shared/short-code", () => ({
  generateShortCode: mocks.generateShortCode
}));

import { handler } from "../../src/handlers/link-handler";

describe("link-handler happy paths", () => {
  it("POST /links creates a short URL", async () => {
    mocks.hashPassword.mockResolvedValue("salt:hash");
    mocks.generateShortCode.mockReturnValue("abc123");
    mocks.tryCreateLink.mockResolvedValue(true);

    const event = makeHttpEvent({
      method: "POST",
      path: "/links",
      body: {
        url: "https://example.com",
        password: "secret123"
      }
    });

    const response = await handler(event);
    expect(response.statusCode).toBe(201);

    const body = JSON.parse(String(response.body));
    expect(body).toEqual({
      shortCode: "abc123",
      shortUrl: "https://sho.rt/abc123"
    });
  });

  it("GET /links/{shortCode} returns metadata", async () => {
    mocks.getLink.mockResolvedValue({
      PK: "LINK#abc123",
      SK: "METADATA",
      entityType: "LINK",
      shortCode: "abc123",
      originalUrl: "https://example.com",
      createdAt: "2026-04-19T10:00:00.000Z",
      clickCount: 12,
      lastAccessedAt: "2026-04-19T12:00:00.000Z"
    });

    const event = makeHttpEvent({
      method: "GET",
      path: "/links/abc123",
      pathParameters: { shortCode: "abc123" }
    });

    const response = await handler(event);
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(String(response.body));
    expect(body.shortCode).toBe("abc123");
    expect(body.originalUrl).toBe("https://example.com");
    expect(body.clickCount).toBe(12);
  });

  it("PATCH /links/{shortCode} updates link settings", async () => {
    mocks.hashPassword.mockResolvedValue("updated:salt-hash");
    mocks.patchLink.mockResolvedValue({
      PK: "LINK#abc123",
      SK: "METADATA",
      entityType: "LINK",
      shortCode: "abc123",
      originalUrl: "https://example.com",
      createdAt: "2026-04-19T10:00:00.000Z",
      clickCount: 12,
      passwordHash: "updated:salt-hash"
    });

    const event = makeHttpEvent({
      method: "PATCH",
      path: "/links/abc123",
      pathParameters: { shortCode: "abc123" },
      body: {
        password: "new-secret"
      }
    });

    const response = await handler(event);
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(String(response.body));
    expect(body.shortCode).toBe("abc123");
    expect(body.isPasswordProtected).toBe(true);
  });

  it("DELETE /links/{shortCode} removes a link", async () => {
    mocks.deleteLinkWithStats.mockResolvedValue(true);

    const event = makeHttpEvent({
      method: "DELETE",
      path: "/links/abc123",
      pathParameters: { shortCode: "abc123" }
    });

    const response = await handler(event);
    expect(response.statusCode).toBe(204);
  });
});
