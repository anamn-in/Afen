export class VolatilityStripper {
  private static readonly HEX_POINTER = /\b0x[0-9a-fA-F]+\b/g;
  private static readonly PROCESS_ID = /\bpid[=\s:]+\d+\b/gi;
  private static readonly THREAD_ID = /\btid[=\s:]+\d+\b/gi;
  private static readonly TIMESTAMP = /\b\d{10,13}\b/g;
  private static readonly TEMP_DIR = /(?:\\temp\\[^\\]+\\|\/tmp\/[^\/]+\/)/gi;

  static strip(text: string): string {
    let cleaned = text;
    cleaned = cleaned.replace(this.HEX_POINTER, '<hex>');
    cleaned = cleaned.replace(this.PROCESS_ID, 'pid=<pid>');
    cleaned = cleaned.replace(this.THREAD_ID, 'tid=<tid>');
    cleaned = cleaned.replace(this.TIMESTAMP, '<timestamp>');
    cleaned = cleaned.replace(this.TEMP_DIR, '<temp>/');
    return cleaned;
  }
}