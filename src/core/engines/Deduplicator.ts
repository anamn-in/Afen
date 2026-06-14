interface DedupEntry {
  count: number;
  firstSeen: number;
  lastSeen: number;
}

export class Deduplicator {
  private cache = new Map<string, DedupEntry>();
  private ttlMs: number;
  private cleanupInterval?: NodeJS.Timeout;
  private static instances: Deduplicator[] = [];

  constructor(ttlMs: number = parseInt(process.env.DEDUP_TTL_SECONDS || '300', 10) * 1000) {
    this.ttlMs = ttlMs;
    Deduplicator.instances.push(this);
    this.startCleanup();
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => this.cleanExpired(), this.ttlMs);
    if (this.cleanupInterval) this.cleanupInterval.unref();
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [fp, entry] of this.cache.entries()) {
      if (now - entry.lastSeen > this.ttlMs) this.cache.delete(fp);
    }
  }

  record(fingerprint: string): { count: number; isDuplicate: boolean } {
    const now = Date.now();
    const existing = this.cache.get(fingerprint);
    if (existing) {
      existing.count++;
      existing.lastSeen = now;
      return { count: existing.count, isDuplicate: true };
    }
    this.cache.set(fingerprint, { count: 1, firstSeen: now, lastSeen: now });
    return { count: 1, isDuplicate: false };
  }

  getCount(fingerprint: string): number {
    return this.cache.get(fingerprint)?.count || 0;
  }

  shutdown(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    const index = Deduplicator.instances.indexOf(this);
    if (index !== -1) Deduplicator.instances.splice(index, 1);
  }

  static shutdownAll(): void {
    for (const instance of Deduplicator.instances) {
      instance.shutdown();
    }
    Deduplicator.instances.length = 0;
  }
}