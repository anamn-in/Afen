import sys
import traceback
import threading
import requests
import os
import time   # added
from typing import Dict, Any

class AfenClient:
    def __init__(self, api_url: str, api_key: str, service_name: str = "python-app"):
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.service_name = service_name
        self._setup_hook()

    def _setup_hook(self):
        sys.excepthook = self._global_exception_handler

    def _global_exception_handler(self, exc_type, exc_value, exc_tb):
        thread = threading.Thread(target=self._send_error, args=(exc_type, exc_value, exc_tb))
        thread.daemon = True
        thread.start()
        sys.__excepthook__(exc_type, exc_value, exc_tb)

    def _send_error(self, exc_type, exc_value, exc_tb):
        formatted = ''.join(traceback.format_exception(exc_type, exc_value, exc_tb))
        payload = {
            "message": str(exc_value),
            "errorType": exc_type.__name__,
            "stackTraceRaw": formatted.splitlines(),
            "environment": dict(os.environ),
            "processInfo": {"pid": os.getpid()},
            "language": "python",
            "timestamp": int(time.time() * 1000),  # now works
            "attributes": {"service": self.service_name},
        }
        try:
            requests.post(
                f"{self.api_url}/ingest",
                json=payload,
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=2
            )
        except Exception:
            pass