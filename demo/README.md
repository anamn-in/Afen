# Afen Demo

This folder is for local demo payloads and scripts that show Afen ingesting errors, building a graph, and returning root-cause evidence.

Afen v1.0.3 runtime:

```text
http://127.0.0.1:8787
```

## Prerequisites

Install the Afen CLI:

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

## Start Runtime

```powershell
afen start
curl http://127.0.0.1:8787/health
```

## Create Demo Error

Create `demo-error.json`:

```json
{
  "language": "typescript",
  "service": "demo-web",
  "environment": "development",
  "severity": "high",
  "message": "TypeError: Cannot read properties of undefined",
  "stackTraceRaw": [
    "mapRows @ DataTable.tsx:10",
    "at DataTable (webpack:///src/components/DataTable.tsx:10:22)",
    "at renderWithHooks (react-dom)"
  ],
  "metadata": {
    "region": "local",
    "version": "demo"
  }
}
```

## Run Demo

```powershell
afen ingest demo-error.json
afen query "SELECT * FROM errors LIMIT 10"
afen graph
afen root-causes
```

Expected:

- ingest succeeds
- query returns an AST response
- graph shows nodes and edges
- root-causes returns confidence and evidence

## Validated Runtime Paths

```text
GET  /health
POST /ingest
POST /query
GET  /graph
GET  /root-causes
```

## Stop Runtime

```powershell
afen stop
```