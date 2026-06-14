# Afen – Universal Debugging Intelligence Layer

[![CI](https://github.com/anamnadmin/Afen/actions/workflows/ci.yml/badge.svg)](https://github.com/anamnadmin/Afen/actions)
[![npm version](https://img.shields.io/npm/v/afen)](https://www.npmjs.com/package/afen)
[![PyPI version](https://img.shields.io/pypi/v/afen)](https://pypi.org/project/afen)
[![Docker](https://img.shields.io/badge/docker-ghcr.io-blue)](https://github.com/anamnadmin/Afen/pkgs/container/afen)

**Afen is a queryable debugging layer for polyglot stacks.**
It ingests runtime errors from 11 languages, normalises them into a structured intermediate representation, and exposes a powerful query language (AQL) to trace, explain, and predict failures across services.

## See It In Action

```sql
EXPLAIN latest
```

```json
{
  "rootCause": {
    "nodeId": "payment_service",
    "cascades": ["TypeError: ...", "ValueError: ..."]
  },
  "recommendation": "Fix missing config in payment service and refresh token in Python worker."
}
```

## Ideal For

- Solo developers and small teams running multi-language apps.
- Anyone tired of stitching together errors from Node.js, Python, Go, Java, Rust, etc.

## Installation

### npm (Node.js server)

```bash
npm install -g afen
afen                # starts the server on port 3000
# or locally:
npx afen
```

### pip (Python SDK client)

```bash
pip install afen
afen --help          # sends a test error to the server
```

### Docker

```bash
docker pull ghcr.io/anamnadmin/afen:latest
docker run -p 3000:3000 ghcr.io/anamnadmin/afen:latest
```

## Documentation

See the [`docs/`](./docs) folder for architecture, usage, AQL reference, and benchmarks.

## License

MIT