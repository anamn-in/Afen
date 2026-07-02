# Afen Benchmarks

This document records validated benchmark and persona-test results for the current release line.

Current validated runtime:

```text
@anamn-in/afen@1.0.5
http://127.0.0.1:8787
```

## Validation Summary

| Area | Result |
|---|---|
| Solo Developer CLI validation | PASS |
| AQL mixed query stress | PASS |
| SRE sequential ingest validation | PASS |
| Large crash ingest | PASS |
| Graph persistence | PASS |
| Root-cause persistence | PASS |
| SDK integration smoke tests | PASS |
| npm packaging validation | PASS |
| Docker/GHCR validation | PASS |
| PyPI publishing validation | PASS |

## Solo Developer Persona

Validated CLI commands:

```text
afen start
afen status
afen ingest
afen query
afen graph
afen root-causes
afen stop
```

AQL stress result:

```text
10,000 / 10,000 mixed valid and invalid queries passed
```

Coverage included:

```text
SELECT
FIND
FILTER
TIME
LIMIT
AND
OR
quoted strings
case-insensitive collection names
aggregate pipes
expected syntax failures
```

## SRE / Platform Persona

Dataset:

```text
100 small error files
10 medium error files
1 large 3000-line Next.js SSR crash
```

Result:

```text
112 / 112 ingests passed
0 freezes
0 request timeouts
graph persisted across restart
root-causes persisted across restart
```

Large crash validation:

```text
stackTraceRaw length: 3000
root-cause marker: mapRows @ DataTable.tsx:10
ingest: PASS
graph nodes and edges: PASS
root-cause confidence: high-confidence attribution confirmed
```

## SDK / Integration Persona

Validated:

```text
JavaScript smoke test: PASS
TypeScript smoke test: PASS
Python HTTP smoke test: PASS
25-event batch test: PASS
runtime-down behavior: PASS
```

## Packaging / Distribution Persona

Validated npm:

```text
npm install
npm run build
npm pack
fresh install from tarball
afen --version
afen start
afen ingest
afen query
```

Validated Docker/GHCR:

```text
docker build
docker run
/health
/ingest
GHCR push
```

Validated PyPI:

```text
python package built
twine check passed
PyPI upload passed
pip install afen
Python smoke passed
```

## Runtime Stability Fixes Validated

Afen v1.0.5 validation confirmed fixes for:

```text
sequential ingest timeout
Windows detached-process stdout pipe deadlock
missing startup migration
stale CLI command registration
Docker runtime startup
Docker port binding
AQL quoted string parsing
graph persistence
root-cause persistence
```

## Manual Benchmark Commands

Start runtime:

```powershell
afen start
curl http://127.0.0.1:8787/health
```

Run a query:

```powershell
afen query "SELECT * FROM errors LIMIT 10"
```

Run graph/root-cause checks:

```powershell
afen graph
afen root-causes
```

Stop runtime:

```powershell
afen stop
```

## AQL Stress Test Shape

The validated stress test mixed valid and intentionally invalid queries.

Valid examples:

```powershell
afen query "SELECT * FROM errors"
afen query "SELECT * FROM ERRORS"
afen query "FIND ERRORS WHERE id == 1"
afen query 'FIND ERRORS WHERE severity == "high"'
afen query "SELECT * FROM errors TIME last 15m"
afen query "SELECT * FROM errors LIMIT 10"
afen query "SELECT * FROM errors FILTER severity == 3 AND status == 1"
afen query "SELECT * FROM errors |> COUNT"
afen query "SELECT * FROM errors |> RANK(severity, count)"
```

Invalid examples:

```powershell
afen query "SELECT"
afen query "SELECT *"
afen query "SELECT * FROM"
afen query "SELECT * FROM errors LIMIT nope"
afen query "SELECT * FROM errors FILTER severity =="
afen query "FIND ERRORS WHERE"
```

Expected behavior:

```text
valid queries return an AST response
invalid queries return an invalid syntax error
runtime remains stable
```

## Interpreting Results

Good signs:

```text
health endpoint responds
queries return AST responses
ingests return accepted responses
graph node count increases after ingest
root-causes returns confidence and evidence
results survive restart
```

Failure signs:

```text
runtime exits after start
health endpoint does not respond
second or later ingest times out
query hangs
graph resets after restart
root-causes always returns only low-confidence fallback
Docker container exits immediately
```
