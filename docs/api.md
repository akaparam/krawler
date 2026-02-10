# API Reference

Base URL examples:

- Local SAM: `http://127.0.0.1:3000`
- Deployed API: output `ApiBaseUrl` from CloudFormation

Use this shell variable in examples:

```bash
BASE_URL="http://127.0.0.1:3000"
```

## 1. Create Short URL

`POST /links`

Request:

```json
{
  "url": "https://example.com",
  "customSlug": "optional",
  "expiresAt": "optional ISO string",
  "password": "optional"
}
```

Response `201`:

```json
{
  "shortCode": "abc123",
  "shortUrl": "https://<domain>/abc123"
}
```

Errors:

- `400` invalid request payload
- `409` custom slug already exists

Happy-case request example:

```bash
curl -i -X POST "$BASE_URL/links" \
  -H "content-type: application/json" \
  -d '{
    "url": "https://example.com/docs",
    "customSlug": "docs123",
    "expiresAt": "2026-12-31T23:59:59.000Z",
    "password": "secret123"
  }'
```

## 2. Redirect

`GET /{shortCode}`

Behavior:

- `404` if link does not exist
- `410` if link is expired
- `401` if password protected and missing/invalid password query parameter
- `302` redirect to original URL when valid

Password-protected example:

`GET /abc123?password=secret`

Happy-case request example:

```bash
curl -i "$BASE_URL/abc123"
```

## 3. Update Link Settings

`PATCH /links/{shortCode}`

Request body supports any subset:

```json
{
  "expiresAt": "optional ISO string or null",
  "password": "optional",
  "removePassword": false
}
```

Notes:

- Send `"expiresAt": null` to remove expiration.
- Send `"removePassword": true` to clear password.
- `password` and `removePassword: true` cannot be combined.

Response `200`:

```json
{
  "shortCode": "abc123",
  "originalUrl": "https://example.com",
  "createdAt": "2026-04-19T05:00:00.000Z",
  "expiresAt": "2026-05-01T00:00:00.000Z",
  "isPasswordProtected": true,
  "clickCount": 42,
  "lastAccessedAt": "2026-04-19T06:00:00.000Z"
}
```

Happy-case request example:

```bash
curl -i -X PATCH "$BASE_URL/links/abc123" \
  -H "content-type: application/json" \
  -d '{
    "expiresAt": "2026-12-31T23:59:59.000Z",
    "password": "new-secret123"
  }'
```

## 4. Get Link Metadata

`GET /links/{shortCode}`

Response `200`:

```json
{
  "shortCode": "abc123",
  "originalUrl": "https://example.com",
  "createdAt": "2026-04-19T05:00:00.000Z",
  "expiresAt": "2026-05-01T00:00:00.000Z",
  "isPasswordProtected": false,
  "clickCount": 42,
  "lastAccessedAt": "2026-04-19T06:00:00.000Z"
}
```

Happy-case request example:

```bash
curl -i "$BASE_URL/links/abc123"
```

## 5. Get Stats Summary

`GET /links/{shortCode}/stats`

Response `200`:

```json
{
  "clickCount": 42,
  "lastAccessedAt": "2026-04-19T06:00:00.000Z"
}
```

Happy-case request example:

```bash
curl -i "$BASE_URL/links/abc123/stats"
```

## 6. Get Daily Stats

`GET /links/{shortCode}/stats/daily`

Response `200`:

```json
[
  { "date": "2026-04-18", "count": 10 },
  { "date": "2026-04-19", "count": 32 }
]
```

Happy-case request example:

```bash
curl -i "$BASE_URL/links/abc123/stats/daily"
```

## 7. Delete Link

`DELETE /links/{shortCode}`

Response:

- `204 No Content` on success
- `404` if link does not exist

Happy-case request example:

```bash
curl -i -X DELETE "$BASE_URL/links/abc123"
```
