# Release v1.0.2 – First Stable Release of Afen

**Release date:** 2026-06-15

Afen is a queryable debugging layer for polyglot stacks. This is the first public release.

## Installation

### npm (Node.js server)

```bash
npm install -g @anamnadmin/afen
afen start
```

### Docker

```bash
docker pull ghcr.io/anamnadmin/afen:latest
docker run -p 3000:3000 ghcr.io/anamnadmin/afen:latest
```

### Python SDK

```bash
pip install afen
afen --send "Test error"
```

## What's Included

- **Multi-language ingestion** – JavaScript, TypeScript, Python, Java, Go, Rust, C, C++, C#, SQL, Ruby
- **5-stage UIR normalisation** – stack parsing, cause-chain unwrapping, path normalisation, volatility stripping, OpenTelemetry mapping
- **3-layer fingerprinting & deduplication** – structural, contextual, system variant
- **Afen Query Language (AQL)** – `TRACE`, `CAUSE`, `EXPLAIN`, `COUNT`, `RANK`, `PREDICT`
- **Kepner-Tregoe root-cause analysis** – fast heuristic + deep change correlation
- **Web UI** – interactive causal graph and AQL terminal
- **SDKs** – JavaScript/TypeScript and Python clients
- **Docker images** on GHCR (`ghcr.io/anamnadmin/afen`)
- **npm package** `@anamnadmin/afen`

## Test Status

- **24 test suites** – all passing
- **110 individual tests** – all passing
- **Code coverage** – statements 90.43%, branches 88.37%, functions 87.32%, lines 90.43%
- **No worker process leaks** – all timers cleaned up, database connections closed

## Changelog (v1.0.2)

- **PyPI package `afen`** published with a working CLI (`afen --send`)
- **Docker images** `ghcr.io/anamnadmin/afen:latest` and `:v1.0.2` built and pushed to GHCR
- **npm package** `@anamnadmin/afen@1.0.2` published (trimmed package contents, fixed entry points)
- **Git tag** `v1.0.2` created
- Fixed Docker build issues: tsconfig path resolution, missing dependencies (`@opentelemetry/*`, `axios`, `pg`), and final stage copy paths
- All documentation updated with final installation commands

## Known Issues / Limitations

- For production, change the default `API_TOKEN` in the `.env` file
- The web UI is built separately; run `npm run build` inside `ui/` if needed
- The npm package does not currently bundle the prebuilt web UI (`ui/dist`)

## Contributors

Afen Contributors (open-source community)

---

**Enjoy debugging with Afen!**
