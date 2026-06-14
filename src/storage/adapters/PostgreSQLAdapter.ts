import { Pool, PoolClient } from 'pg';
import { StorageAdapter } from '../StorageAdapter';
import { NormalizedUIREvent } from '@models/uir/UIREvent';

export class PostgreSQLAdapter implements StorageAdapter {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString, max: 10 });
  }

  private async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async insertEvent(event: NormalizedUIREvent): Promise<void> {
    const client = await this.getClient();
    try {
      await client.query(
        `INSERT INTO events (id, fingerprint_structural, fingerprint_contextual, fingerprint_system, uir_json, ingested_at, language, error_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET uir_json = EXCLUDED.uir_json`,
        [
          event.id,
          event.fingerprint.structural,
          event.fingerprint.contextual,
          event.fingerprint.systemVariant,
          JSON.stringify(event),
          event.ingestedAt,
          event.sourceLanguage,
          event.errorType,
        ]
      );
    } finally {
      client.release();
    }
  }

  async findEventsByFingerprint(fingerprint: string, limit = 100): Promise<NormalizedUIREvent[]> {
    const client = await this.getClient();
    try {
      const res = await client.query(
        `SELECT uir_json FROM events WHERE fingerprint_system = $1 ORDER BY ingested_at DESC LIMIT $2`,
        [fingerprint, limit]
      );
      return res.rows.map((row: { uir_json: string }) => JSON.parse(row.uir_json));
    } finally {
      client.release();
    }
  }

  async getTimeSeries(fingerprint: string, startTime: number, endTime: number): Promise<{ timestamp: number; count: number }[]> {
    const client = await this.getClient();
    try {
      const res = await client.query(
        `SELECT ingested_at, COUNT(*) as count FROM events
         WHERE fingerprint_system = $1 AND ingested_at BETWEEN $2 AND $3
         GROUP BY date_trunc('hour', to_timestamp(ingested_at/1000))
         ORDER BY ingested_at`,
        [fingerprint, startTime, endTime]
      );
      return res.rows.map((r: { ingested_at: string | number; count: string | number }) => ({ timestamp: Number(r.ingested_at), count: Number(r.count) }));
    } finally {
      client.release();
    }
  }

  async getFingerprintStats(fingerprint: string) {
    const client = await this.getClient();
    try {
      const res = await client.query(
        `SELECT count, first_seen, last_seen, resolved FROM fingerprints WHERE fingerprint = $1`,
        [fingerprint]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateFingerprintCount(fingerprint: string, timestamp: number): Promise<void> {
    const client = await this.getClient();
    try {
      await client.query(
        `INSERT INTO fingerprints (fingerprint, count, first_seen, last_seen, resolved)
         VALUES ($1, 1, $2, $2, false)
         ON CONFLICT (fingerprint) DO UPDATE SET
           count = fingerprints.count + 1,
           last_seen = EXCLUDED.last_seen`,
        [fingerprint, timestamp]
      );
    } finally {
      client.release();
    }
  }

  async markFingerprintResolved(fingerprint: string): Promise<void> {
    const client = await this.getClient();
    try {
      await client.query(`UPDATE fingerprints SET resolved = true WHERE fingerprint = $1`, [fingerprint]);
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}