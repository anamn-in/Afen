# Afen Release Notes

## v1.0.3

Afen v1.0.3 focuses on runtime stability, CLI consistency, AQL correctness, graph persistence, Docker reliability, npm packaging, Python SDK publishing, and validated developer experience.

## Distribution Artifacts

### npm

```text
@anamn-in/afen@1.0.3
```

### Docker / GHCR

```text
ghcr.io/anamn-in/afen:latest
ghcr.io/anamn-in/afen:v1.0.3
```

### Python / PyPI

```text
afen==1.0.2
```

The validated Python package name is `afen`.

## Major Fixes

- Stabilized the runtime on port `8787`.
- Fixed CLI command registration.
- Added or restored `afen status`.
- Added or restored `afen stop`.
- Added or restored `afen ingest`.
- Added or restored `afen graph`.
- Added or restored `afen root-causes`.
- Added `afen --version`.
- Kept `afen send-error` as a backward-compatible ingest alias.
- Fixed CLI help output to match supported commands.
- Fixed `afen start` output so the printed URL matches the real runtime URL.
- Migrated runtime routes to Fastify.
- Fixed sequential ingest timeout under SRE load.
- Fixed Windows detached-process stdout pipe deadlock.
- Added startup migration execution.
- Fixed Docker runtime startup and port binding.
- Fixed npm package build output and bin path.
- Published working GHCR images.
- Published Python package to PyPI.

## AQL Improvements

- Added quoted string support.
- Added case-insensitive collection handling.
- Added `LIMIT` validation.
- Added `TIME` validation.
- Added `AND` and `OR` filter support.
- Added aggregate pipe validation.
- Validated `COUNT` and `RANK(...)` pipe forms.

Validated examples:

```powershell
afen query "SELECT * FROM errors"
afen query "SELECT * FROM ERRORS"
afen query "SELECT id FROM errors"
afen query "FIND ERRORS"
afen query "FIND ERRORS WHERE id == 1"
afen query 'FIND ERRORS WHERE severity == "high"'
afen query 'SELECT message FROM errors FILTER status != "resolved"'
afen query "SELECT * FROM errors TIME last 15m"
afen query "SELECT * FROM errors LIMIT 10"
afen query "SELECT * FROM errors FILTER severity >= 3"
afen query "SELECT * FROM errors FILTER severity == 3 AND status == 1"
afen query "SELECT * FROM errors FILTER severity == 3 OR status == 1"
afen query "SELECT * FROM errors |> COUNT"
afen query "SELECT * FROM errors |> RANK(severity, count)"
```

## Graph And Root-Cause Improvements

- Added persistent graph storage.
- Added persistent root-cause results.
- Confirmed graph data survives runtime restart.
- Confirmed root-cause results survive runtime restart.
- Added source-frame classification for root-cause attribution.
- Improved confidence for explicit source markers such as:

```text
mapRows @ DataTable.tsx:10
```

## Validation Results

### Solo Developer Persona

Status: PASS

- `afen start`: PASS
- `afen status`: PASS
- `afen ingest`: PASS
- `afen graph`: PASS
- `afen root-causes`: PASS
- `afen query`: PASS
- 10,000 mixed valid/invalid AQL queries: PASS

### SRE / Platform Persona

Status: PASS

- 100 small error files: PASS
- 10 medium error files: PASS
- 1 large 3000-line Next.js SSR crash: PASS
- 112 total ingests: PASS
- sequential ingest stability: PASS
- graph persistence across restart: PASS
- root-cause persistence across restart: PASS

### SDK / Integration Persona

Status: PASS

- JavaScript smoke test: PASS
- TypeScript smoke test: PASS
- Python HTTP smoke test: PASS
- 25-event batch test: PASS
- runtime-down behavior: PASS

### Packaging / Distribution Persona

Status: PASS

- npm local tarball install: PASS
- npm global CLI validation: PASS
- Docker build: PASS
- Docker run: PASS
- Docker health check: PASS
- Docker ingest: PASS
- GHCR push: PASS
- PyPI publish: PASS

### Documentation / DX Persona

Status: in progress

Completed:

- top-level README refreshed
- Quickstart refreshed
- AQL docs refreshed
- Troubleshooting docs refreshed
- release notes refreshed
- stale docs removed after merge
- stale package, endpoint, and port references cleaned

## Compatibility Notes

- Default runtime port is `8787`.
- Docker should expose `8787:8787`.
- AQL currently returns parsed AST responses.
- `docs/AQL.md` is the source of truth for validated v1.0.3 query syntax.
- Older runtime and query examples were replaced with the validated v1.0.3 command set.

## Historical Note: v1.0.2

v1.0.2 was the first stable public release line and included npm, Docker/GHCR, and Python package distribution work.

v1.0.3 hardens that release line with validated runtime behavior, corrected packaging, Docker fixes, CLI consistency, persistence validation, and stronger root-cause attribution.
