import { RawErrorPayload } from '@models/uir/UIREvent';

export class RuntimeWatcher {
  private watching = false;
  private listeners: ((payload: RawErrorPayload) => void)[] = [];

  start(): void {
    if (this.watching) return;
    this.watching = true;
    const originalWrite = process.stderr.write;
    process.stderr.write = (chunk: any, ...args: any[]) => {
      const msg = chunk.toString();
      if (msg.includes('Error') || msg.includes('Exception')) {
        const fakePayload: RawErrorPayload = {
          message: msg,
          errorType: 'RuntimeError',
          stackTraceRaw: msg.split('\n'),
          environment: process.env as Record<string, string>,
          processInfo: { pid: process.pid },
          language: 'unknown',
          timestamp: Date.now(),
        };
        this.emit(fakePayload);
      }
      return originalWrite.call(process.stderr, chunk, ...args);
    };
  }

  onError(callback: (payload: RawErrorPayload) => void): void {
    this.listeners.push(callback);
  }

  private emit(payload: RawErrorPayload): void {
    this.listeners.forEach(cb => cb(payload));
  }

  stop(): void {
    this.watching = false;
  }
}