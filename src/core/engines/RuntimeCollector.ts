export interface IngestPayload {
  errorType: string;
  message?: string;
  stackTraceRaw?: string | string[];
  language?: string;
  [key: string]: any; // for additional metadata
}

export class RuntimeCollector {
  private buffer: IngestPayload[] = [];
  private processing: boolean = false;

  constructor() {
    // No dependencies
  }

  async ingest(payload: IngestPayload): Promise<void> {
    this.buffer.push(payload);
    if (!this.processing) {
      await this.processBuffer();
    }
  }

  private async processBuffer(): Promise<void> {
    this.processing = true;
    while (this.buffer.length > 0) {
      const batch = this.buffer.splice(0, 10);
      await Promise.all(batch.map(p => this.processSingle(p)));
    }
    this.processing = false;
  }

  private async processSingle(payload: IngestPayload): Promise<void> {
    // Placeholder: can be extended for batch persistence
    console.log(`[Collector] Processed error: ${payload.errorType}`);
    // Could add further processing: store to DB, call analyzers, etc.
  }
}