import { DialectClient } from './DialectClient';
import { createTablesSQL } from './Schema';

export class Migrator {
  static async run(): Promise<void> {
    const client = DialectClient.getInstance();
    const db = client.getDB();
    db.exec(createTablesSQL);
    console.log('[Migrator] Database schema ready');
  }
}