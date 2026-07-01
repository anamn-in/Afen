import argparse
from .client import AfenClient
def main():
    parser = argparse.ArgumentParser(description="Afen Python SDK – send errors to Afen server")
    parser.add_argument("--send", help="Send a test error message to Afen")
    parser.add_argument("--api-url", default="http://127.0.0.1:8787", help="Afen server URL")
    parser.add_argument("--api-key", default="afen-dev-key-change-me", help="API key (default: development key)")
    args = parser.parse_args()
    if args.send:
        client = AfenClient(args.api_url, args.api_key)
        try:
            raise Exception(args.send)
        except Exception as e:
            client._send_error(type(e), e, e.__traceback__)
            print(f"? Test error sent: {args.send}")
    else:
        print("Usage: afen --send 'Your error message'")
if __name__ == "__main__":
    main()


