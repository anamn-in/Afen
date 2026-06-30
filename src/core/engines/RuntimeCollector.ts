export interface IngestPayload {
  errorType: string;
  message?: string;
  stackTraceRaw?: string | string[];
  language?: string;
  [key: string]: any;
}

export class RuntimeCollector {
  private buffer: IngestPayload[] = [];
  private processing: boolean = false;

  async ingest(payload: IngestPayload): Promise<void> {
    this.buffer.push(payload);
    console.log(`[Collector] Buffer size: ${this.buffer.length}, processing: ${this.processing}`);
    if (!this.processing) {
      console.log('[Collector] Starting buffer processing...');
      await this.processBuffer();
    } else {
      console.log('[Collector] Buffer already processing, enqueued.');
    }
  }

  private async processBuffer(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      while (this.buffer.length > 0) {
        const batch = this.buffer.splice(0, 10);
        console.log(`[Collector] Processing batch of ${batch.length} items`);
        await Promise.all(batch.map(p => this.processSingle(p)));
        console.log(`[Collector] Batch complete, ${this.buffer.length} items left`);
      }
      console.log('[Collector] Buffer fully processed');
    } catch (err) {
      console.error('[Collector] Error processing batch:', err);
    } finally {
      this.processing = false;
      console.log('[Collector] Processing flag reset');
    }
  }

  private async processSingle(payload: IngestPayload): Promise<void> {
    console.log(`[Collector] Processing error: ${payload.errorType}`);
    await Promise.resolve(); // placeholder
    console.log(`[Collector] Processed error: ${payload.errorType}`);
  }
}