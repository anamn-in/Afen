# Afen JavaScript / TypeScript SDK

JavaScript and TypeScript client source for sending runtime errors to an Afen runtime.

Current package name in this workspace:

```text
@anamn-in/afen-client
```

Afen runtime default:

```text
http://127.0.0.1:8787
```

## Requirements

- Node.js 18+
- A running Afen runtime

Start Afen:

```powershell
afen start
curl http://127.0.0.1:8787/health
```

## Build

From this folder:

```powershell
npm install
npm run build
```

## Usage

```typescript
import { AfenClient } from '@anamn-in/afen-client';

const client = new AfenClient({
  apiUrl: 'http://127.0.0.1:8787',
  apiKey: 'local-dev-token',
  serviceName: 'my-node-service'
});
```

The client registers global handlers for:

```text
uncaughtException
unhandledRejection
```

Unhandled errors are sent to:

```text
POST /ingest
```

## Sent Payload Shape

The SDK sends payloads like:

```json
{
  "message": "Cannot read properties of undefined",
  "errorType": "TypeError",
  "stackTraceRaw": [
    "TypeError: Cannot read properties of undefined",
    "at handler (/src/index.ts:10:5)"
  ],
  "environment": {},
  "processInfo": {
    "pid": 1234,
    "cwd": "/app"
  },
  "language": "javascript",
  "timestamp": 1748012345678
}
```

## Local Runtime Validation

```powershell
afen start
afen graph
afen root-causes
```

Then run your Node.js app with the SDK initialized and trigger an unhandled error.

## Notes

- The main Afen CLI/runtime npm package is `@anamn-in/afen`.
- This SDK package is separate from the CLI/runtime package.
- Use port `8787` for the validated v1.0.3 runtime.
- Do not use old docs that reference port `3000`.
