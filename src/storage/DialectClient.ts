import { existsSync, mkdirSync } from 'fs';
import path from 'path';

// Try to load better-sqlite3; fall back to sqlite3 if native bindings fail
let Database: any;
let useBetterSqlite3 = true;
try {
  Database = require('better-sqlite3');
} catch (err) {
  console.warn('[DialectClient] better-sqlite3 failed to load, falling back to sqlite3 (pure JS).');
  useBetterSqlite3 = false;
  Database = require('sqlite3').Database;
}

export class DialectClient {
  private db: any;
  private static instance: DialectClient;

  private constructor(dbPath: string) {
    if (dbPath !== ':memory:') {
      const dir = path.dirname(dbPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }
    if (useBetterSqlite3) {
      this.db = new Database(dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
    } else {
      // sqlite3 (async) – wrap methods to be synchronous-like
      this.db = new Database(dbPath);
      this.db.exec = (sql: string) => {
        return new Promise<void>((resolve, reject) => {
          this.db.exec(sql, (err: any) => {
            if (err) reject(err);
            else resolve(); // void resolved correctly
          });
        });
      };
      this.db.prepare = (sql: string) => {
        const stmt = this.db.prepare(sql);
        return {
          run: (...args: any[]) => {
            return new Promise<void>((resolve, reject) => {
              stmt.run(...args, (err: any) => {
                if (err) reject(err);
                else resolve();
              });
            });
          },
          get: (...args: any[]) => {
            return new Promise<any>((resolve, reject) => {
              stmt.get(...args, (err: any, row: any) => {
                if (err) reject(err);
                else resolve(row);
              });
            });
          },
          all: (...args: any[]) => {
            return new Promise<any[]>((resolve, reject) => {
              stmt.all(...args, (err: any, rows: any) => {
                if (err) reject(err);
                else resolve(rows);
              });
            });
          },
        };
      };
    }
  }

  static getInstance(dbPath: string = process.env.DB_PATH || path.join(process.cwd(), 'data', 'afen.db')): DialectClient {
    if (!DialectClient.instance) {
      DialectClient.instance = new DialectClient(dbPath);
    }
    return DialectClient.instance;
  }

  getDB(): any {
    return this.db;
  }

  prepare(sql: string): any {
    if (useBetterSqlite3) {
      return this.db.prepare(sql);
    } else {
      return this.db.prepare(sql);
    }
  }

  transaction<T>(fn: () => T): T {
    if (useBetterSqlite3) {
      const trans = this.db.transaction(fn);
      return trans();
    } else {
      // For sqlite3 fallback, we must keep synchronous behaviour – we'll just execute directly.
      return fn();
    }
  }

  close(): void {
    this.db.close();
    DialectClient.instance = null as any;
  }
}