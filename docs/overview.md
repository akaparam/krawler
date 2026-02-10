# Backend Overview

## Architecture

HTTP API Gateway routes to three Lambda functions:

- `LinkHandlerFunction` for create, metadata read, partial update, delete.
- `RedirectFunction` for public redirect and analytics increment.
- `StatsFunction` for summary and daily analytics read.

All functions use a single DynamoDB table: `UrlShortenerTable`.

## DynamoDB Single-Table Design

### Primary Key

- `PK` (string)
- `SK` (string)

### Entity: Link

- `PK = LINK#{shortCode}`
- `SK = METADATA`

Attributes:

- `originalUrl`
- `createdAt` (ISO string)
- `expiresAt` (epoch seconds, used as DynamoDB TTL)
- `passwordHash` (optional, salted scrypt hash)
- `clickCount` (number)
- `lastAccessedAt` (ISO string, optional)
- `entityType = LINK`

### Entity: Daily Stats

- `PK = LINK#{shortCode}`
- `SK = STATS#{YYYY-MM-DD}`

Attributes:

- `date`
- `count`
- `entityType = DAILY_STATS`

## Access Patterns

- Read link metadata by `PK + SK`.
- Create link with conditional write to prevent collisions.
- Partial updates using dynamic `UpdateExpression`.
- Increment clicks using atomic counter.
- Aggregate daily counts with `STATS#` records.
- Query daily stats via `begins_with(SK, "STATS#")`.

## Expiration Strategy

- `expiresAt` is stored as epoch seconds.
- DynamoDB TTL eventually purges expired items.
- Redirect checks expiration synchronously and returns `410 Gone` immediately.
