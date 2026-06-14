# Afen SDK

Client libraries for capturing and sending runtime errors to an Afen instance.

| Package | Language | Registry |
|---|---|---|
| `@anamnadmin/afen-client` | JavaScript / TypeScript | npm |
| `afen-client` | Python | PyPI |

---

## Contents

- [JavaScript / TypeScript SDK](#javascript--typescript-sdk)
- [Python SDK](#python-sdk)
- [Error Object Reference](#error-object-reference)
- [Contributing](#contributing)

---

## JavaScript / TypeScript SDK

### Installation

```bash
npm install @anamnadmin/afen-client
```

### Quick start

```typescript
import { AfenClient } from '@anamnadmin/afen-client';

const client = new AfenClient({
  apiUrl: 'http://localhost:3000',
  apiKey: 'your-api-token',
  serviceName: 'my-service',
});
```

Once initialised, the client automatically intercepts:

- `uncaughtException` (Node.js)
- `unhandledRejection` (Node.js)
- `window.onerror` (browser)
- `window.onunhandledrejection` (browser)

### Manual capture

```typescript
try {
  await processPayment(payload);
} catch (err) {
  await client.capture(err, { context: { orderId: payload.id } });
  throw err;
}
```

### Configuration

```typescript
const client = new AfenClient({
  apiUrl: 'http://localhost:3000',   // required — Afen server URL
  apiKey: 'your-api-token',          // required — API key
  serviceName: 'my-service',         // required — identifies the source service
  environment: 'production',         // optional — default: 'development'
  release: '1.4.2',                  // optional — correlate errors to a deploy
  autoCapture: true,                 // optional — default: true
  timeout: 5000,                     // optional — request timeout in ms, default: 5000
});
```

### Disable auto-capture

```typescript
const client = new AfenClient({
  apiUrl: 'http://localhost:3000',
  apiKey: 'your-api-token',
  serviceName: 'my-service',
  autoCapture: false,                // manage capture manually
});
```

### Express middleware

```typescript
import { afenMiddleware } from '@anamnadmin/afen-client/middleware';

app.use(afenMiddleware(client));
```

Captures all unhandled Express errors and attaches `req.path`, `req.method`, and `res.statusCode` as context.

### TypeScript types

```typescript
import type { AfenClientOptions, CaptureOptions, AfenError } from '@anamnadmin/afen-client';
```

---

## Python SDK

### Installation

```bash
pip install afen-client
```

### Quick start

```python
from afen_client import AfenClient

client = AfenClient(
    api_url='http://localhost:3000',
    api_key='your-api-token',
    service_name='my-service',
)
```

Auto-capture registers a global `sys.excepthook` that forwards all unhandled exceptions to Afen.

### Manual capture

```python
try:
    process_payment(payload)
except Exception as e:
    client.capture(e, context={'order_id': payload['id']})
    raise
```

### Async support

```python
import asyncio
from afen_client import AfenClient

client = AfenClient(
    api_url='http://localhost:3000',
    api_key='your-api-token',
    service_name='my-service',
)

async def main():
    try:
        await process_payment(payload)
    except Exception as e:
        await client.capture_async(e)
        raise
```

### Django integration

```python
# settings.py
MIDDLEWARE = [
    'afen_client.integrations.django.AfenMiddleware',
    ...
]

AFEN = {
    'API_URL': 'http://localhost:3000',
    'API_KEY': 'your-api-token',
    'SERVICE_NAME': 'my-django-app',
}
```

### Configuration

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `api_url` | `str` | ✓ | — | Afen server URL |
| `api_key` | `str` | ✓ | — | API key |
| `service_name` | `str` | ✓ | — | Identifies the source service |
| `environment` | `str` | | `'development'` | Deployment environment |
| `release` | `str` | | `None` | Release/version tag |
| `auto_capture` | `bool` | | `True` | Register global exception hook |
| `timeout` | `int` | | `5` | Request timeout in seconds |

### Requirements

- Python ≥ 3.8
- `requests` ≥ 2.28.0

---

## Error Object Reference

Both SDKs send errors in the Afen UIR (Unified Intermediate Representation) format:

```json
{
  "language": "nodejs",
  "type": "TypeError",
  "message": "Cannot read properties of undefined",
  "stack": "...",
  "serviceName": "my-service",
  "environment": "production",
  "release": "1.4.2",
  "timestamp": "2025-06-12T10:00:00Z",
  "context": {}
}
```

---

## Contributing

See [`CONTRIBUTING.md`](../../CONTRIBUTING.md) at the repo root.

Both packages follow the same release cycle. Bump `version` in `package.json` (JS) or `setup.py` (Python) before opening a release PR.
