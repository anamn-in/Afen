# Afen Usage Guide

Afen is a **queryable debugging layer for polyglot stacks**. It helps you trace root causes across services written in different languages.

## Quick Start with npm

```bash
npm install -g afen
afen
```

Then send errors to `http://localhost:3000/ingest` and query with AQL.

## Quick Start with Docker

```bash
docker pull ghcr.io/anamnadmin/afen:latest
docker run -p 3000:3000 ghcr.io/anamnadmin/afen:latest
```

## Example: Node.js + Python

See the [`demo/`](../demo) folder for a complete cross-language error chain resolution.

## AQL Commands

- `TRACE <error_id>` – show the execution path.
- `CAUSE <error_id>` – list direct causes with confidence.
- `EXPLAIN <error_id>` – generate a human-readable explanation.
- `COUNT` / `RANK` – aggregate error frequencies.
- `PREDICT` – forecast future failure probabilities.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (default 3000) |
| `NODE_ENV` | `development` or `production` |
| `STORAGE_ADAPTER` | `sqlite` (default) or `postgres` |
| `DATABASE_URL` | PostgreSQL connection string |
| `API_TOKEN` | Bearer token for authenticated endpoints |
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error` |
| `DEDUP_TTL_SECONDS` | TTL for deduplication cache (seconds) |

## Contributing

Afen is open-source. We welcome issues and pull requests at [GitHub](https://github.com/anamnadmin/Afen).