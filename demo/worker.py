import requests
import time
import traceback
import os

def level2():
    raise ValueError("Invalid state: token expired")

def level1():
    try:
        level2()
    except ValueError as e:
        raise Exception("Authorization failed") from e

if __name__ == "__main__":
    time.sleep(2)
    try:
        level1()
    except Exception as e:
        payload = {
            "message": str(e),
            "errorType": type(e).__name__,
            "stackTraceRaw": traceback.format_exc().splitlines(),
            "innerError": {
                "message": str(e.__cause__),
                "errorType": type(e.__cause__).__name__,
                "stackTraceRaw": traceback.format_exception_only(type(e.__cause__), e.__cause__)[0].splitlines()
            } if e.__cause__ else None,
            "environment": dict(os.environ),
            "processInfo": {"pid": os.getpid()},
            "language": "python",
            "timestamp": int(time.time() * 1000)
        }
        requests.post("http://127.0.0.1:8787/ingest", json=payload)
        print("Ingested Python error")

