# Troubleshooting

Common Afen setup, runtime, ingest, query, and packaging issues.

## `afen` Is Not Recognized

Cause: the npm global bin folder is not in your `PATH`, or the package is not installed globally.

Fix:

```powershell
npm install -g @anamnadmin/afen
afen --help
```

If it still fails, restart the terminal and try again.

## `afen --version` Fails

Cause: an older CLI build may be installed.

Fix:

```powershell
npm uninstall -g @anamnadmin/afen
npm install -g @anamnadmin/afen
afen --version
```

Expected:

```text
1.0.3
```

## Runtime Does Not Start

Run:

```powershell
afen start
```

Then verify:

```powershell
curl http://127.0.0.1:8787/health
```

If health fails, check whether another process is using port `8787`.

## Runtime Starts But Health Fails

Cause: the server process may have exited after startup.

Fix:

```powershell
afen stop
afen start
curl http://127.0.0.1:8787/health
```

Expected: health returns successfully.

## Port Already In Use

Afen uses port `8787` by default.

Check the port:

```powershell
netstat -ano | findstr :8787
```

Stop the conflicting process or restart Afen:

```powershell
afen stop
afen start
```

## `afen status` Says Not Running

Cause: runtime is stopped, or a stale PID was left behind.

Fix:

```powershell
afen stop
afen start
afen status
```

Expected: runtime reports running at `http://127.0.0.1:8787`.

## Ingest Fails

Check that the file exists and is valid JSON:

```powershell
Get-Content sample-error.json
```

Then retry:

```powershell
afen ingest sample-error.json
```

Required fields:

```text
language
message
stackTraceRaw
```

Recommended fields:

```text
service
environment
severity
timestamp
metadata
```

## Ingest Times Out

Cause: runtime is not reachable, or the server process is stuck.

Fix:

```powershell
curl http://127.0.0.1:8787/health
afen stop
afen start
afen ingest sample-error.json
```

Afen v1.0.3 includes fixes for sequential ingest timeout issues.

## Query Returns Invalid AQL Syntax

Cause: the query does not match supported AQL grammar.

Valid examples:

```powershell
afen query "SELECT * FROM errors"
afen query "SELECT * FROM errors LIMIT 10"
afen query "FIND ERRORS WHERE id == 1"
afen query 'FIND ERRORS WHERE severity == "high"'
```

See `docs/AQL.md`.

## Quoted Strings Fail In Queries

Cause: an older CLI/runtime build may be installed.

Fix:

```powershell
npm uninstall -g @anamnadmin/afen
npm install -g @anamnadmin/afen
afen --version
```

Expected version:

```text
1.0.3
```

Then retry:

```powershell
afen query 'FIND ERRORS WHERE severity == "high"'
```

## Graph Is Empty

Cause: no errors have been ingested yet, or the runtime data store is fresh.

Fix:

```powershell
afen ingest sample-error.json
afen graph
```

Expected: graph shows node and edge counts.

## Root Causes Return Low Confidence

Cause: the stack trace may not contain app-owned frames or explicit source markers.

Higher-confidence signals include:

```text
mapRows @ DataTable.tsx:10
webpack:///src/components/DataTable.tsx:10:22
/src/components/DataTable.tsx
```

Framework-only traces may correctly return low confidence.

## Docker Container Starts But Health Fails

Check logs:

```powershell
docker logs afen-local-validation
```

Run with port mapping:

```powershell
docker run -p 8787:8787 ghcr.io/anamnadmin/afen:latest
```

Verify:

```powershell
curl http://127.0.0.1:8787/health
```

## Docker Cannot Pull GHCR Image

Use the GHCR image name:

```powershell
docker pull ghcr.io/anamnadmin/afen:latest
```

If the image is private, authenticate:

```powershell
docker login ghcr.io
```

## Python Package Name

The Python package is named:

```text
afen
```

Install:

```powershell
pip install afen
```

Import:

```python
import afen
```

Do not use `afen-sdk` as the PyPI package name.

## npm Tarball Validation

From the Afen repo:

```powershell
cd C:\Users\V\Afen\configs
npm pack
```

Install the generated `.tgz` in a clean folder:

```powershell
npm install C:\Users\V\Afen\configs\anamnadmin-afen-1.0.3.tgz
```

## Build Fails With Missing Dependencies

From:

```powershell
C:\Users\V\Afen\configs
```

run:

```powershell
npm install
npm run build
```

If TypeScript alias imports appear in `dist`, rebuild and verify alias rewriting.

## Clean Restart Checklist

Use this when behavior looks stale:

```powershell
afen stop
afen start
curl http://127.0.0.1:8787/health
afen --version
afen ingest sample-error.json
afen graph
afen root-causes
```
