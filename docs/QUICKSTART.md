# Afen Quickstart

This guide validates Afen from a fresh user workflow.

Afen is a local-first error intelligence engine. It ingests runtime errors, builds an error graph, and returns root-cause evidence through the local runtime.

## 1. Install

```powershell
npm install -g @anamn-in/afen
```

Verify the installed CLI version:

```powershell
afen --version
```

Expected:

```text
1.0.3
```

View available commands:

```powershell
afen --help
```

Expected commands include:

```text
afen start
afen status
afen stop
afen ingest <json-file>
afen send-error <json-file>
afen query "<AQL command>"
afen graph
afen root-causes
```

## 2. Start Runtime

```powershell
afen start
```

Expected:

```text
AFEN Runtime started.
Address: http://127.0.0.1:8787
```

## 3. Verify Runtime Health

```powershell
curl http://127.0.0.1:8787/health
```

Expected: a successful health response from the runtime.

## 4. Create A Sample Error

Create `sample-error.json` in your project folder:

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

## 5. Ingest The Error

```powershell
afen ingest sample-error.json
```

Expected:

```text
Ingested successfully.
```

Backward-compatible alias:

```powershell
afen send-error sample-error.json
```

## 6. Query Errors

```powershell
afen query "SELECT * FROM errors LIMIT 10"
```

Expected: a JSON response containing an `ast` object.

More examples:

```powershell
afen query "SELECT * FROM errors"
afen query "FIND ERRORS WHERE severity == high"
afen query 'FIND ERRORS WHERE severity == "high"'
afen query "SELECT * FROM errors |> COUNT"
```

## 7. Inspect The Error Graph

```powershell
afen graph
```

Expected: graph output showing node and edge counts.

## 8. Inspect Root Causes

```powershell
afen root-causes
```

Expected: root-cause output with confidence and evidence.

Explicit source markers can produce high-confidence attribution:

```text
mapRows @ DataTable.tsx:10
```

## 9. Stop Runtime

```powershell
afen stop
```

Expected:

```text
AFEN Runtime stopped.
```

## Docker Quickstart

Pull the GHCR image:

```powershell
docker pull ghcr.io/anamn-in/afen:latest
```

Run the container:

```powershell
docker run -p 8787:8787 ghcr.io/anamn-in/afen:latest
```

Verify health:

```powershell
curl http://127.0.0.1:8787/health
```

## Python SDK Quickstart

Install the Python package:

```powershell
pip install afen
```

Use package name:

```python
import afen
```

The PyPI package is `afen`, not `afen-sdk`.

## Runtime Defaults

Default runtime URL:

```text
http://127.0.0.1:8787
```

Default local port:

```text
8787
```

## Useful Environment Variables

```text
PORT
AFEN_RUNTIME_PORT
AFEN_RUNTIME_HOST
NODE_ENV
STORAGE_ADAPTER
DATABASE_URL
API_TOKEN
LOG_LEVEL
```

## Next Steps

- Read `docs/AQL.md` for query syntax.
- Read `docs/TROUBLESHOOTING.md` for common setup and runtime fixes.
- Use `afen graph` and `afen root-causes` after ingesting errors.
