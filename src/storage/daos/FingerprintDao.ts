import { DialectClient } from '../DialectClient';

export class FingerprintDao {
  private upsertStmt: any = null;
  private getStatsStmt: any = null;
  private markResolvedStmt: any = null;

  private ensurePrepared() {
    if (!this.upsertStmt) {
      const client = DialectClient.getInstance();
      this.upsertStmt = client.prepare(`
        INSERT INTO fingerprints (fingerprint, count, first_seen, last_seen, resolved)
        VALUES (?, 1, ?, ?, 0)
        ON CONFLICT(fingerprint) DO UPDATE SET
          count = count + 1,
          last_seen = excluded.last_seen
      `);
      this.getStatsStmt = client.prepare(`SELECT count, first_seen, last_seen, resolved FROM fingerprints WHERE fingerprint = ?`);
      this.markResolvedStmt = client.prepare(`UPDATE fingerprints SET resolved = 1 WHERE fingerprint = ?`);
    }
  }

  record(fingerprint: string, timestamp: number): void {
    this.ensurePrepared();
    this.upsertStmt.run(fingerprint, timestamp, timestamp);
  }

  getStats(fingerprint: string): { count: number; first_seen: number; last_seen: number; resolved: number } | undefined {
    this.ensurePrepared();
    return this.getStatsStmt.get(fingerprint) as any;
  }

  markResolved(fingerprint: string): void {
    this.ensurePrepared();
    this.markResolvedStmt.run(fingerprint);
  }
}