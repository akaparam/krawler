# Testing

This project has:

- Handler-level unit tests (fast route/response checks)
- Full HTTP E2E flow test (what frontend consumes)

## Run tests

```bash
make test
```

`make test` runs API unit tests.

Run E2E test:

```bash
E2E_BASE_URL="https://<your-api-domain>" make test-e2e
```

Local SAM example:

```bash
E2E_BASE_URL="http://127.0.0.1:3000" make test-e2e
```

If `E2E_BASE_URL` is not set, E2E test is skipped.
For local SAM, ensure the Lambda environment points to a reachable DynamoDB table.

## Unit coverage map

- `POST /links` -> `api/tests/handlers/link-handler.test.ts`
- `GET /links/{shortCode}` -> `api/tests/handlers/link-handler.test.ts`
- `PATCH /links/{shortCode}` -> `api/tests/handlers/link-handler.test.ts`
- `DELETE /links/{shortCode}` -> `api/tests/handlers/link-handler.test.ts`
- `GET /{shortCode}` -> `api/tests/handlers/redirect.test.ts`
- `GET /links/{shortCode}/stats` -> `api/tests/handlers/stats.test.ts`
- `GET /links/{shortCode}/stats/daily` -> `api/tests/handlers/stats.test.ts`

## E2E coverage

- `api/tests/e2e/url-shortener.e2e.test.ts` runs full API flow:
- `POST /links`
- `GET /links/{shortCode}`
- `GET /{shortCode}?password=...`
- `GET /links/{shortCode}/stats`
- `GET /links/{shortCode}/stats/daily`
- `PATCH /links/{shortCode}`
- `GET /{shortCode}`
- `DELETE /links/{shortCode}`
- `GET /links/{shortCode}` (expects `404` after delete)

## Notes

- Unit tests are handler-level and mock repository/security dependencies.
- E2E test is real HTTP traffic against `E2E_BASE_URL`.
