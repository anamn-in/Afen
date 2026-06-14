import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export class DialectClient {
  private db: Database.Database;
  private static instance: DialectClient;

  private constructor(dbPath: string) {
    if (dbPath !== ':memory:') {
      const dir = path.dirname(dbPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  static getInstance(dbPath: string = process.env.DB_PATH || path.join(process.cwd(), 'data', 'afen.db')): DialectClient {
    if (!DialectClient.instance) {
      DialectClient.instance = new DialectClient(dbPath);
    }
    return DialectClient.instance;
  }

  getDB(): Database.Database {
    return this.db;
  }

  prepare(sql: string): Database.Statement {
    return this.db.prepare(sql);
  }

  transaction<T>(fn: () => T): T {
    const trans = this.db.transaction(fn);
    return trans();
  }

  close(): void {
    this.db.close();
    DialectClient.instance = null as any;
  }
}