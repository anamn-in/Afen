# Afen — Universal Debugging Intelligence

Afen is a cross-language error reasoning engine that ingests runtime errors from any supported language, normalises them into a Unified Intermediate Representation (UIR), and lets you query the full causal chain with a single AQL statement.

**Supported languages:** Node.js · Python · Java · Rust · Go · TypeScript · C · C++ · C# · SQL

---

## Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Demo: Cross-Language Cascade](#demo-cross-language-cascade)
- [AQL Reference](#aql-reference)
- [HTTP API](#http-api)
- [Configuration](#configuration)
- [Development](#development)
- [Publishing](#publishing)

---

## Architecture

```
Runtime Errors
     │
     ▼
Language Adapters  ──►  UIR Normaliser  ──►  Error Store
                                                   │
                                              AQL Engine
                                                   │
                                            Resolution Output
```

Each adapter converts raw stack traces into a language-agnostic UIR object. The AQL engine queries the store and resolves root-cause chains across language boundaries.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Docker + Compose | 24+ |
| Node.js | 18+ |
| Python | 3.8+ |
| `jq` | any (optional, pretty output) |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/afen.git
cd afen

# 2. Install dependencies
npm install

# 3. Start the server
npm start
# Server: http://localhost:3000
# Health:  http://localhost:3000/health
```

**With Docker:**

```bash
docker compose up --build
```

---

## Demo: Cross-Language Cascade

The `demo/` directory ships a self-contained scenario that demonstrates Afen resolving a Node.js → Python error cascade with a single AQL query.

### What it does

1. Starts an Afen container.
2. Node.js throws `TypeError` wrapped as `Error("Payment processing failed")`.
3. Python throws `ValueError` wrapped as `Exception("Authorization failed")`.
4. Both errors are ingested via the HTTP API.
5. `EXPLAIN latest` returns a combined root-cause chain.

### Run

```bash
cd demo
./run.sh
```

Or with `jq` for formatted output:

```bash
./run.sh | jq
```

### Expected output

```json
{
  "rootCause": {
    "message": "Authorization failed",
    "language": "python",
    "cascades": [
      {
        "message": "Payment processing failed",
        "language": "nodejs",
        "type": "TypeError"
      }
    ]
  }
}
```

### Cleanup

```bash
# Ctrl+C to stop, then:
docker compose down
```

---

## AQL Reference

AQL (Afen Query Language) is a declarative query language for error chains.

```aql
-- Get the latest error
EXPLAIN latest

-- Filter by language
EXPLAIN latest WHERE language = "python"

-- Filter by time range
EXPLAIN errors SINCE 10m

-- Aggregate by type
SELECT type, COUNT(*) FROM errors GROUP BY type

-- Pipeline chaining
EXPLAIN latest | WHERE severity = "critical" | LIMIT 5
```

Full grammar: [`docs/aql.md`](docs/aql.md)

---

## HTTP API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/errors` | Ingest one or more errors |
| `POST` | `/query` | Run an AQL query |
| `GET` | `/errors/:id` | Fetch a single error by ID |

### Ingest an error

```bash
curl -X POST http://localhost:3000/errors \
  -H "Content-Type: application/json" \
  -d '{
    "language": "nodejs",
    "type": "TypeError",
    "message": "Payment processing failed",
    "stack": "..."
  }'
```

### Run a query

```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{ "query": "EXPLAIN latest" }'
```

---

## Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP server port |
| `LOG_LEVEL` | `info` | `debug` · `info` · `warn` · `error` |
| `MAX_CHAIN_DEPTH` | `10` | Max cascade resolution depth |

Set via environment or a `.env` file at the project root.

---

## Development

```bash
# Run tests (110 tests across 24 suites)
npm test

# Watch mode
npm run test:watch

# Coverage report (enforced floor: 80%)
npm run test:coverage

# Type check
npm run typecheck

# Lint
npm run lint
```

CI runs on every push to `main` and `develop` via GitHub Actions. Coverage below the floor blocks merge.

### Project structure

```
afen/
├── src/
│   ├── adapters/       # Per-language UIR adapters
│   ├── aql/            # AQL parser and engine
│   ├── server/         # HTTP API (Express)
│   ├── store/          # In-memory error store
│   └── uir/            # Unified Intermediate Representation
├── demo/               # Cross-language cascade demo
├── ui/                 # Debug UI (Vite + React)
├── tests/              # 24 test suites
└── docker-compose.yml
```

---

## Publishing

The package is published to npm as `@anamnadmin/afen`.

```bash
npm run build
npm publish --access public
```

Ensure `version` in `package.json` is bumped before publishing.

---

## License

MIT © Anamn
