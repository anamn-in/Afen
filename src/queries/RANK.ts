import { DialectClient } from '@storage/DialectClient';

export async function rank(limit: number = 10): Promise<Array<{ fingerprint: string; count: number }>> {
  const db = DialectClient.getInstance().getDB();
  const stmt = db.prepare(`
    SELECT fingerprint, count FROM fingerprints
    ORDER BY count DESC, last_seen DESC
    LIMIT ?
  `);
  const rows = stmt.all(limit) as { fingerprint: string; count: number }[];
  return rows;
}