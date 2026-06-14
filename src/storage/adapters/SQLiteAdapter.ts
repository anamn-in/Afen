import { DialectClient } from '../DialectClient';
import { StorageAdapter } from '../StorageAdapter';
import { NormalizedUIREvent } from '@models/uir/UIREvent';

export class SQLiteAdapter implements StorageAdapter {
  private client: DialectClient;

  constructor() {
    this.client = DialectClient.getInstance();
  }

  insertEvent(event: NormalizedUIREvent): void {
    const stmt = this.client.prepare(`
      INSERT OR REPLACE INTO events (id, fingerprint_structural, fingerprint_contextual, fingerprint_system, uir_json, ingested_at, language, error_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      event.id,
      event.fingerprint.structural,
      event.fingerprint.contextual,
      event.fingerprint.systemVariant,
      JSON.stringify(event),
      event.ingestedAt,
      event.sourceLanguage,
      event.errorType
    );
  }

  findEventsByFingerprint(fingerprint: string, limit = 100): Promise<NormalizedUIREvent[]> {
    const stmt = this.client.prepare(`
      SELECT uir_json FROM events WHERE fingerprint_system = ? ORDER BY ingested_at DESC LIMIT ?
    `);
    const rows = stmt.all(fingerprint, limit) as { uir_json: string }[];
    return Promise.resolve(rows.map(row => JSON.parse(row.uir_json)));
  }

  getTimeSeries(fingerprint: string, startTime: number, endTime: number): Promise<{ timestamp: number; count: number }[]> {
    const stmt = this.client.prepare(`
      SELECT ingested_at, COUNT(*) as count FROM events
      WHERE fingerprint_system = ? AND ingested_at BETWEEN ? AND ?
      GROUP BY strftime('%Y-%m-%d %H', datetime(ingested_at/1000, 'unixepoch'))
      ORDER BY ingested_at
    `);
    const rows = stmt.all(fingerprint, startTime, endTime) as { ingested_at: number; count: number }[];
    return Promise.resolve(rows.map(r => ({ timestamp: r.ingested_at, count: r.count })));
  }

  getFingerprintStats(fingerprint: string) {
    const stmt = this.client.prepare(`SELECT count, first_seen, last_seen, resolved FROM fingerprints WHERE fingerprint = ?`);
    return Promise.resolve(stmt.get(fingerprint) as any);
  }

  updateFingerprintCount(fingerprint: string, timestamp: number): void {
    const stmt = this.client.prepare(`
      INSERT INTO fingerprints (fingerprint, count, first_seen, last_seen, resolved)
      VALUES (?, 1, ?, ?, 0)
      ON CONFLICT(fingerprint) DO UPDATE SET
        count = count + 1,
        last_seen = excluded.last_seen
    `);
    stmt.run(fingerprint, timestamp, timestamp);
  }

  markFingerprintResolved(fingerprint: string): void {
    const stmt = this.client.prepare(`UPDATE fingerprints SET resolved = 1 WHERE fingerprint = ?`);
    stmt.run(fingerprint);
  }

  close(): void {
    this.client.close();
  }
}