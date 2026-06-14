import { RawErrorPayload } from '@models/uir/UIREvent';

export class RuntimeCollector {
  private buffer: RawErrorPayload[] = [];
  private processing = false;

  async ingest(payload: RawErrorPayload): Promise<void> {
    this.buffer.push(payload);
    if (!this.processing) await this.processBuffer();
  }

  private async processBuffer(): Promise<void> {
    this.processing = true;
    while (this.buffer.length > 0) {
      const batch = this.buffer.splice(0, 10);
      await Promise.all(batch.map(p => this.processSingle(p)));
    }
    this.processing = false;
  }

  private async processSingle(payload: RawErrorPayload): Promise<void> {
    // Placeholder: can be extended for batch persistence
    console.log(`[Collector] Processed error: ${payload.errorType}`);
  }
}