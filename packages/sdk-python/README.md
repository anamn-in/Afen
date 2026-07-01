# Afen Python SDK

Python client for sending runtime errors to an Afen runtime.

PyPI package:

```text
afen
```

Install:

```powershell
pip install afen
```

Import:

```python
from afen.client import AfenClient
```

Afen runtime default:

```text
http://127.0.0.1:8787
```

## Requirements

- Python 3.8+
- `requests>=2.28.0`
- A running Afen runtime

Start Afen:

```powershell
afen start
curl http://127.0.0.1:8787/health
```

## Quick Start

```python
from afen.client import AfenClient

client = AfenClient(
    api_url="http://127.0.0.1:8787",
    api_key="local-dev-token",
    service_name="python-app"
)

raise RuntimeError("Python SDK smoke error")
```

The client registers a global `sys.excepthook`. Unhandled exceptions are sent to:

```text
POST /ingest
```

## Sent Payload Shape

The SDK sends payloads like:

```json
{
  "message": "Python SDK smoke error",
  "errorType": "RuntimeError",
  "stackTraceRaw": [
    "Traceback (most recent call last):",
    "RuntimeError: Python SDK smoke error"
  ],
  "environment": {},
  "processInfo": {
    "pid": 1234
  },
  "language": "python",
  "timestamp": 1748012345678,
  "attributes": {
    "service": "python-app"
  }
}
```

## Validate In Afen

After triggering an error:

```powershell
afen graph
afen root-causes
```

## Package Name

Use:

```powershell
pip install afen
```

Validated package:

```text
afen==1.0.2
```

Validated with Afen runtime:

```text
@anamnadmin/afen@1.0.3
```