# Afen Python SDK

Capture runtime errors and send them to an Afen instance.

- Automatic capture of unhandled exceptions via `sys.excepthook`
- Manual capture with optional context
- Async support
- Django middleware integration
- Python ≥ 3.8, zero heavy dependencies

---

## Installation

```bash
pip install afen-client
```

---

## Quick Start

```python
from afen.client import AfenClient

client = AfenClient(
    api_url="http://localhost:3000",
    api_key="your-api-token",
    service_name="my-service",
)
```

That's it. A global `sys.excepthook` is registered automatically — all unhandled exceptions are forwarded to Afen without any further setup.

---

## Manual Capture

```python
try:
    process_payment(payload)
except Exception as e:
    client.capture(e, context={"order_id": payload["id"]})
    raise
```

---

## Async Support

```python
async def handler(request):
    try:
        await process_payment(payload)
    except Exception as e:
        await client.capture_async(e, context={"order_id": payload["id"]})
        raise
```

---

## Disable Auto-Capture

```python
client = AfenClient(
    api_url="http://localhost:3000",
    api_key="your-api-token",
    service_name="my-service",
    auto_capture=False,
)
```

---

## Django Integration

```python
# settings.py
MIDDLEWARE = [
    "afen.integrations.django.AfenMiddleware",
    ...
]

AFEN = {
    "API_URL": "http://localhost:3000",
    "API_KEY": "your-api-token",
    "SERVICE_NAME": "my-django-app",
}
```

Captures all unhandled Django exceptions and attaches `request.path`, `request.method`, and response status as context.

---

## Configuration

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `api_url` | `str` | ✓ | — | Afen server URL |
| `api_key` | `str` | ✓ | — | API key |
| `service_name` | `str` | ✓ | — | Identifies the source service |
| `environment` | `str` | | `"development"` | Deployment environment |
| `release` | `str` | | `None` | Release or version tag |
| `auto_capture` | `bool` | | `True` | Register global exception hook |
| `timeout` | `int` | | `5` | Request timeout in seconds |

---

## Requirements

- Python ≥ 3.8
- `requests` ≥ 2.28.0

---

## License

MIT © Anamn
