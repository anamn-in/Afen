import { FingerprintDao } from '@storage/daos/FingerprintDao';

export async function count(fingerprint?: string): Promise<number> {
  const dao = new FingerprintDao();
  if (fingerprint) {
    const stats = dao.getStats(fingerprint);
    return stats?.count || 0;
  }
  // Add .js extension for node16 module resolution
  const { DialectClient } = await import('../storage/DialectClient.js');
  const db = DialectClient.getInstance().getDB();
  const row = db.prepare('SELECT COUNT(*) as total FROM fingerprints').get() as { total: number };
  return row.total;
}