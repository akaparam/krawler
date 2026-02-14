# Krawler URL Shortener

Monorepo with a serverless API and a React UI:

- `api/`: AWS SAM + Lambda + DynamoDB backend
- `ui/`: Vite + React + Tailwind frontend
- `docs/`: API, architecture, deployment, and testing docs

## Repository Layout

```text
.
├── api/
│   ├── src/
│   ├── tests/
│   ├── template.yaml
│   ├── samconfig.toml
│   └── package.json
├── ui/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── docs/
├── Makefile
└── README.md
```

## Quickstart

1. Install dependencies for both projects and create `ui/.env`:

```bash
make bootstrap
```

2. Set backend URL for UI (if needed):

```bash
# ui/.env
VITE_API_BASE_URL=http://127.0.0.1:3000
```

3. Run both API + UI locally:

```bash
make dev
```

- API: `http://127.0.0.1:3000`
- UI: Vite default (`http://127.0.0.1:5173`)

## Common Commands

```bash
make dev-api      # only SAM local API
make dev-ui       # only UI dev server
make test         # API unit tests
make test-e2e     # API E2E tests (requires E2E_BASE_URL)
make build        # API + UI build
make clean        # remove local build artifacts
```

E2E example:

```bash
E2E_BASE_URL="https://<api-domain>" make test-e2e
```

## API Scope

Implemented backend endpoints:

- `POST /links`
- `GET /{shortCode}`
- `PATCH /links/{shortCode}`
- `GET /links/{shortCode}`
- `GET /links/{shortCode}/stats`
- `GET /links/{shortCode}/stats/daily`
- `DELETE /links/{shortCode}`

## Documentation

- [Architecture & Data Model](docs/overview.md)
- [API Reference](docs/api.md)
- [Deployment & Operations](docs/deployment.md)
- [Testing](docs/testing.md)
