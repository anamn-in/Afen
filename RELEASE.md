# Release v1.0.1 – First Stable Release of Afen

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

The Python SDK is **not yet published on PyPI**. The name `afen` appears to be already taken. We are exploring alternatives (`afen-sdk`, `afen-client`) and will update once published. For now, you can install directly from GitHub:

```bash
pip install git+https://github.com/anamnadmin/Afen.git#subdirectory=packages/sdk-python
```

## What's Included

- **Multi-language ingestion** – JavaScript, TypeScript, Python, Java, Go, Rust, C, C++, C#, SQL, Ruby.
- **5-stage UIR normalisation** – stack parsing, cause-chain unwrapping, path normalisation, volatility stripping, OpenTelemetry mapping.
- **3-layer fingerprinting & deduplication** – structural, contextual, system variant.
- **Afen Query Language (AQL)** – `TRACE`, `CAUSE`, `EXPLAIN`, `COUNT`, `RANK`, `PREDICT`.
- **Kepner-Tregoe root-cause analysis** – fast heuristic + deep change correlation.
- **Web UI** – interactive causal graph and AQL terminal.
- **CLI** – `afen start`, `afen send-error`, `afen query`.
- **SDKs** – JavaScript/TypeScript and Python clients.
- **Docker images** on GHCR (`ghcr.io/anamnadmin/afen`).
- **npm package** `@anamnadmin/afen`.

## Test Status

- **24 test suites** – all passing
- **110 individual tests** – all passing
- **Code coverage** – statements 90.43%, branches 88.37%, functions 87.32%, lines 90.43%
- **No worker process leaks** – all timers cleaned up, database connections closed

## Changelog (v1.0.1)

- Initial public release.
- Full test suite passing with >90% coverage.
- Added `afen` CLI (`start`, `send-error`, `query` commands).
- Complete documentation in [`docs/`](https://github.com/anamnadmin/Afen/tree/main/docs).
- Demo scripts in [`demo/`](https://github.com/anamnadmin/Afen/tree/main/demo).

## Known Issues / Limitations

- PyPI package not yet published – name `afen` is unavailable. Workarounds:
  - Install directly from GitHub (see above).
  - We may publish under a different name (e.g., `afen-sdk`) in the future.
- For production, change the default `API_TOKEN` in the `.env` file.
- The web UI build (React) is separate; run `npm run build` inside `ui/` if needed.

## Contributors

Afen Contributors (open-source community).

---

**Enjoy debugging with Afen!**