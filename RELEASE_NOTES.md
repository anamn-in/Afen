# Afen Release Notes

## v1.0.5

Afen v1.0.5 is a patch release that finalizes Fresh User / Zero-Context onboarding validation.

### Fixed

* Fixed graph persistence visibility after runtime restart.
* Rehydrated the graph route from the persisted graph store before returning `/graph`.
* Added SQLite WAL checkpointing for graph node, edge, frame-count, and clear operations.
* Ensured fresh npm installs preserve graph output across `afen stop` / `afen start`.

### Validated

* Fresh install from npm: `@anamn-in/afen@1.0.5`
* `afen --version` returns `1.0.5`
* `afen start`, `afen status`, `afen ingest`, `afen query`, `afen graph`, and `afen root-causes` work from a new folder
* Graph nodes and edges persist after daemon restart
* Test suite remains green: 14 suites, 49 tests

### Distribution

* npm package: `@anamn-in/afen@1.0.5`
* Docker/GHCR image should be rebuilt and pushed as `ghcr.io/anamn-in/afen:v1.0.5`
* PyPI package remains `afen`

## v1.0.3

Afen v1.0.3 focuses on runtime stability, CLI consistency, AQL correctness, graph persistence, Docker reliability, npm packaging, Python SDK publishing, and validated developer experience.

### Published Artifacts

```text
@anamn-in/afen@1.0.3
```

```text
ghcr.io/anamn-in/afen:latest
ghcr.io/anamn-in/afen:v1.0.3
```

```text
pip install afen
```

### Runtime

* Migrated the local runtime to Fastify.
* Standardized runtime port on `8787`.
* Fixed runtime startup reliability from the CLI.
* Added runtime health validation.
* Fixed Windows detached-process startup behavior.
* Ensured runtime migrations run on startup.

### CLI

Validated commands:

```powershell
afen --version
afen --help
afen start
afen stop
afen status
afen ingest .\sample-error.json
afen send-error .\sample-error.json
afen query "SELECT * FROM errors"
afen graph
afen root-causes
```

### AQL

Validated AQL syntax:

```aql
SELECT * FROM errors
SELECT id FROM errors
SELECT * FROM errors FILTER severity >= 3
SELECT * FROM errors FILTER severity == 3 AND status == 1
SELECT * FROM errors FILTER severity == 3 OR status == 1
SELECT * FROM errors TIME last 15m
SELECT * FROM errors LIMIT 10
SELECT * FROM errors |> COUNT
SELECT * FROM errors |> RANK(severity, count)

FIND ERRORS
FIND ERRORS WHERE id == 1
FIND ERRORS WHERE severity == "high"
```

Collection names are case-insensitive:

```aql
SELECT * FROM errors
SELECT * FROM ERRORS
FIND errors WHERE id == 1
FIND ERRORS WHERE id == 1
```

Removed from public docs as unsupported legacy syntax:

```text
TRACE
CAUSE
EXPLAIN
PREDICT
FORECAST
```

### Persistence

* Graph nodes persist across runtime restart.
* Graph edges persist across runtime restart.
* Root-cause results persist across runtime restart.
* SQLite persistence added for graph nodes, edges, and frame counts.

### Root-Cause Attribution

* Added source-frame classification.
* Added explicit marker detection.
* Improved confidence for clear app-owned stack frames.
* Large Next.js SSR crash root cause now identifies source-level frames with high confidence.

### Packaging

* npm package build output validated.
* Clean tarball install validated.
* CLI version output validated.
* Docker image build validated.
* GHCR image run validated.
* PyPI package `afen` published and smoke-tested.

### Validated Personas

* Solo Developer Persona
* SRE / Platform Persona
* SDK / Integration Persona
* Packaging / Distribution Persona
* Documentation / DX Persona
* Release Readiness / Code Hygiene Persona

### Known Notes

* Python SDK package name is `afen`, not `afen-sdk`.
* The main npm CLI/runtime package is `@anamn-in/afen`.
* Docker/GHCR runtime image is `ghcr.io/anamn-in/afen`.
* AQL currently returns parsed AST output for query validation workflows.
* `docs/AQL.md` is the source of truth for validated v1.0.3 query syntax.

### Upgrade Notes

For npm users:

```powershell
npm uninstall -g @anamn-in/afen
npm install -g @anamn-in/afen
afen --version
```

For Docker/GHCR users:

```powershell
docker pull ghcr.io/anamn-in/afen:latest
docker run -p 8787:8787 ghcr.io/anamn-in/afen:latest
```

For Python SDK users:

```powershell
pip install afen
```

v1.0.3 hardened the first public release line with validated runtime behavior, corrected packaging, Docker fixes, CLI consistency, persistence validation, and stronger root-cause attribution.
