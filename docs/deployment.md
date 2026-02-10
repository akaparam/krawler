# Deployment and Operations

## 1. Install Dependencies

```bash
make bootstrap
```

## 2. Build

```bash
cd api
sam build
```

## 3. Deploy

```bash
cd api
sam deploy --guided
```

Recommended deploy inputs:

- Stack name: `krawler-url-shortener`
- Region: your target AWS region
- Confirm changes before deploy: `yes`
- Allow SAM IAM role creation: `yes`
- Parameter `BaseUrl`: optional public short domain, for example `https://sho.rt`

## 4. Outputs

After deployment, note these stack outputs:

- `ApiBaseUrl`
- `DynamoTableName`

## 5. Operational Notes

- Redirect endpoint validates expiration before redirecting.
- Link expiration uses DynamoDB TTL (`expiresAt` epoch seconds). TTL deletion is asynchronous; expired links still return `410` immediately before physical deletion.
- Passwords are hashed using salted `scrypt`.
- Analytics updates are atomic counters in DynamoDB.

## 6. Local Run

```bash
make dev-api
```

Use `curl` or Postman against `http://127.0.0.1:3000`.
