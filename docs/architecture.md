# Afen Architecture

Afen is a local-first error intelligence engine. It ingests runtime error payloads, normalizes stack traces, stores events locally, builds a graph, and exposes query and root-cause inspection through the CLI and HTTP runtime.

Default runtime URL:

```text
http://127.0.0.1:8787
```

## Runtime Flow

```text
CLI / SDK / HTTP client
        |
        v
Fastify API runtime
        |
        v
Ingest route
        |
        v
RuntimeCollector
        |
        v
UIR pipeline
        |
        v
Fingerprinting + deduplication
        |
        v
Event storage + graph persistence
        |
        v
Graph / root-causes / query routes
```

## CLI Layer

Validated commands:

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

`send-error` is kept as a backward-compatible alias for ingestion.

## API Runtime Layer

Afen v1.0.3 uses Fastify for the local runtime.

Validated routes:

```text
GET  /health
POST /ingest
POST /query
GET  /graph
GET  /root-causes
```

The runtime listens on port `8787`.

## Ingestion Layer

The ingestion layer accepts structured JSON error payloads.

Minimum useful fields:

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
requestId
metadata
```

Example payload:

```json
{
  "language": "typescript",
  "service": "web",
  "environment": "production",
  "severity": "high",
  "message": "TypeError: Cannot read properties of undefined",
  "stackTraceRaw": [
    "mapRows @ DataTable.tsx:10",
    "at DataTable (webpack:///src/components/DataTable.tsx:10:22)"
  ],
  "metadata": {
    "region": "us-east-1",
    "version": "v1.0.3"
  }
}
```

## UIR Pipeline

The UIR pipeline normalizes raw runtime input into a consistent internal representation.

Responsibilities:

```text
stack trace normalization
frame extraction
source path cleanup
fingerprint input preparation
metadata preservation
```

## Fingerprinting

Afen produces multiple fingerprint values for ingested errors.

Validated response shape includes:

```text
structural
contextual
systemVariant
```

These fingerprints support deduplication and grouping.

## Graph Layer

The graph layer stores error nodes and relationships.

Validated behavior:

```text
graph nodes persist across runtime restart
graph edges persist across runtime restart
graph output is available through afen graph
```

Persistence is handled through SQLite-backed storage.

## Root-Cause Layer

The root-cause layer ranks likely sources and returns evidence.

Validated response fields:

```text
nodeId
score
confidence
evidence
```

Afen v1.0.3 includes source-frame classification.

High-confidence signals include explicit source markers:

```text
mapRows @ DataTable.tsx:10
```

and app-owned source frames:

```text
webpack:///src/components/DataTable.tsx:10:22
/src/components/DataTable.tsx
```

Framework-only or ambiguous traces may correctly return low confidence.

## Query Layer

Afen Query Language is exposed through:

```powershell
afen query "<AQL command>"
```

In v1.0.3, AQL validates query syntax and returns a parsed AST response.

Validated syntax includes:

```text
SELECT
FIND
FILTER
TIME
LIMIT
AND
OR
|> COUNT
|> RANK(...)
```

Collection names are case-insensitive:

```powershell
afen query "SELECT * FROM errors"
afen query "SELECT * FROM ERRORS"
```

See `docs/AQL.md`.

## Storage

Afen uses local persistence for runtime data.

Validated persistence:

```text
events persist
graph persists
root-causes persist
```

Runtime database files should not be committed:

```text
*.db
*.db-shm
*.db-wal
```

## Distribution Architecture

Validated distribution paths:

```text
npm:    @anamnadmin/afen@1.0.3
Docker: ghcr.io/anamnadmin/afen:latest
Docker: ghcr.io/anamnadmin/afen:v1.0.3
PyPI:   afen==1.0.2
```

## Validated Integration Paths

```text
CLI ingest
JavaScript HTTP/SDK workflow
TypeScript HTTP/SDK workflow
Python HTTP/SDK workflow
Docker runtime
```