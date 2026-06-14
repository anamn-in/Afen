import { DialectClient } from '../DialectClient';
import { NormalizedUIREvent } from '@models/uir/UIREvent';

export class EventDao {
  private insertStmt: any = null;
  private findByFingerprintStmt: any = null;
  private getTimeSeriesStmt: any = null;
  private getLatestFingerprintStmt: any = null;

  private ensurePrepared() {
    if (!this.insertStmt) {
      const client = DialectClient.getInstance();
      this.insertStmt = client.prepare(`
        INSERT OR REPLACE INTO events (id, fingerprint_structural, fingerprint_contextual, fingerprint_system, uir_json, ingested_at, language, error_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      this.findByFingerprintStmt = client.prepare(`
        SELECT uir_json FROM events WHERE fingerprint_system = ? ORDER BY ingested_at DESC LIMIT ?
      `);
      this.getTimeSeriesStmt = client.prepare(`
        SELECT ingested_at, COUNT(*) as count FROM events
        WHERE fingerprint_system = ? AND ingested_at BETWEEN ? AND ?
        GROUP BY strftime('%Y-%m-%d %H', datetime(ingested_at/1000, 'unixepoch'))
        ORDER BY ingested_at
      `);
      this.getLatestFingerprintStmt = client.prepare(`
        SELECT fingerprint_system FROM events ORDER BY ingested_at DESC LIMIT 1
      `);
    }
  }

  insert(event: NormalizedUIREvent): void {
    this.ensurePrepared();
    this.insertStmt.run(
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

  findByFingerprint(fingerprint: string, limit = 100): NormalizedUIREvent[] {
    this.ensurePrepared();
    const rows = this.findByFingerprintStmt.all(fingerprint, limit) as { uir_json: string }[];
    return rows.map(row => JSON.parse(row.uir_json));
  }

  getTimeSeries(fingerprint: string, startTime: number, endTime: number): { timestamp: number; count: number }[] {
    this.ensurePrepared();
    const rows = this.getTimeSeriesStmt.all(fingerprint, startTime, endTime) as { ingested_at: number; count: number }[];
    return rows.map(r => ({ timestamp: r.ingested_at, count: r.count }));
  }

  getLatestFingerprint(): string | null {
    this.ensurePrepared();
    const row = this.getLatestFingerprintStmt.get() as { fingerprint_system: string } | undefined;
    return row ? row.fingerprint_system : null;
  }
}