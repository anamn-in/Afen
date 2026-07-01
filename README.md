# Afen

Afen is a local-first error intelligence engine for developers and platform teams.

It ingests runtime errors, stack traces, and crash payloads, then builds a local error graph to help identify root causes, repeated failures, and high-signal debugging paths.

## Current Validated Release

| Artifact | Package | Version |
|---|---|---|
| npm CLI/runtime | `@anamnadmin/afen` | `1.0.3` |
| Docker image | `ghcr.io/anamnadmin/afen` | `latest`, `v1.0.3` |
| Python package | `afen` | `1.0.2` |

Default runtime URL:

```text
http://127.0.0.1:8787
```

## What Afen Does

- Ingests structured error payloads.
- Parses stack traces.
- Builds a persistent local error graph.
- Tracks root-cause evidence.
- Supports AQL query validation through `afen query`.
- Runs locally through npm or Docker.
- Supports JavaScript, TypeScript, and Python integration workflows validated in release testing.

## Install

### npm

```powershell
npm install -g @anamnadmin/afen
```

Verify:

```powershell
afen --version
```

Expected:

```text
1.0.3
```

### Docker / GHCR

```powershell
docker pull ghcr.io/anamnadmin/afen:latest
docker run -p 8787:8787 ghcr.io/anamnadmin/afen:latest
```

Verify:

```powershell
curl http://127.0.0.1:8787/health
```

### Python

```powershell
pip install afen
```

The Python package name is `afen`, not `afen-sdk`.

## Quick Start

Start the runtime:

```powershell
afen start
```

Check runtime health:

```powershell
curl http://127.0.0.1:8787/health
```

Create `sample-error.json`:

```json
{
  "language": "typescript",
  "service": "web",
  "environment": "production",
  "severity": "high",
  "message": "TypeError: Cannot read properties of undefined",
  "stackTraceRaw": [
    "mapRows @ DataTable.tsx:10",
    "at DataTable (webpack:///src/components/DataTable.tsx:10:22)",
    "at renderWithHooks (react-dom)"
  ],
  "metadata": {
    "region": "us-east-1",
    "version": "v1.0.3"
  }
}
```

Ingest the error:

```powershell
afen ingest sample-error.json
```

Query errors:

```powershell
afen query "SELECT * FROM errors LIMIT 10"
```

Inspect graph data:

```powershell
afen graph
```

Inspect root causes:

```powershell
afen root-causes
```

Stop the runtime:

```powershell
afen stop
```

## AQL Examples

```powershell
afen query "SELECT * FROM errors"
afen query "SELECT * FROM ERRORS"
afen query "FIND ERRORS WHERE id == 1"
afen query 'FIND ERRORS WHERE severity == "high"'
afen query "SELECT * FROM errors FILTER severity >= 3"
afen query "SELECT * FROM errors FILTER severity == 3 AND status == 1"
afen query "SELECT * FROM errors TIME last 15m"
afen query "SELECT * FROM errors LIMIT 10"
afen query "SELECT * FROM errors |> COUNT"
afen query "SELECT * FROM errors |> RANK(severity, count)"
```

Collection names are case-insensitive, so `errors` and `ERRORS` are both valid.

See `docs/AQL.md` for the full validated syntax.

## CLI Commands

```text
afen start
afen status
afen stop
afen ingest <json-file>
afen send-error <json-file>
afen query "<AQL command>"
afen graph
afen root-causes
afen --version
afen --help
```

`send-error` is kept as a backward-compatible alias for error ingestion.

## Documentation

- `docs/QUICKSTART.md`
- `docs/AQL.md`
- `docs/TROUBLESHOOTING.md`
- `docs/architecture.md`
- `docs/benchmarks.md`
- `RELEASE_NOTES.md`

## Validated Personas

- Solo Developer Persona: PASS
- SRE / Platform Persona: PASS
- SDK / Integration Persona: PASS
- Packaging / Distribution Persona: PASS
- Documentation / DX Persona: in progress

## Validation Highlights

- 10,000 mixed AQL queries passed.
- 112 SRE ingest payloads passed.
- 3000-line Next.js SSR crash ingested successfully.
- Graph persistence confirmed across restart.
- Root-cause persistence confirmed across restart.
- Explicit source marker attribution reached high confidence.
- npm package validation passed.
- Docker/GHCR validation passed.
- Python package validation passed.

## Troubleshooting

See `docs/TROUBLESHOOTING.md`.

Common checks:

```powershell
afen --version
afen start
curl http://127.0.0.1:8787/health
afen ingest sample-error.json
afen graph
afen root-causes
```

## License

MIT