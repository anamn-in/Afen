import { DialectClient } from '../DialectClient';

export interface GraphNodeData {
  id: string;
  data: any;
}

export interface GraphEdgeData {
  id: string;
  data: any;
}

export class GraphDao {
  private client: DialectClient;
  private stmtUpsertNode: any;
  private stmtGetAllNodes: any;
  private stmtDeleteNode: any;
  private stmtUpsertEdge: any;
  private stmtGetAllEdges: any;
  private stmtDeleteEdge: any;
  private stmtIncrementFrameCount: any;
  private stmtGetFrameCount: any;
  private stmtGetAllFrameCounts: any;
  private stmtClearNodes: any;
  private stmtClearEdges: any;
  private stmtClearFrameCounts: any;

  constructor(client: DialectClient) {
    this.client = client;
    this.initSchema();
    this.prepareStatements();
  }

  private initSchema(): void {
    const db = this.client.getDB();
    db.exec(`
      CREATE TABLE IF NOT EXISTS graph_nodes (
        id TEXT PRIMARY KEY,
        data_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS graph_edges (
        id TEXT PRIMARY KEY,
        data_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS frame_counts (
        frame_key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0
      );
    `);
  }

  private prepareStatements(): void {
    const db = this.client.getDB();
    this.stmtUpsertNode = db.prepare(`
      INSERT OR REPLACE INTO graph_nodes (id, data_json) VALUES (?, ?)
    `);
    this.stmtGetAllNodes = db.prepare(`SELECT id, data_json FROM graph_nodes`);
    this.stmtDeleteNode = db.prepare(`DELETE FROM graph_nodes WHERE id = ?`);
    this.stmtUpsertEdge = db.prepare(`
      INSERT OR REPLACE INTO graph_edges (id, data_json) VALUES (?, ?)
    `);
    this.stmtGetAllEdges = db.prepare(`SELECT id, data_json FROM graph_edges`);
    this.stmtDeleteEdge = db.prepare(`DELETE FROM graph_edges WHERE id = ?`);
    this.stmtIncrementFrameCount = db.prepare(`
      INSERT INTO frame_counts (frame_key, count) VALUES (?, 1)
      ON CONFLICT(frame_key) DO UPDATE SET count = count + 1
    `);
    this.stmtGetFrameCount = db.prepare(`SELECT count FROM frame_counts WHERE frame_key = ?`);
    this.stmtGetAllFrameCounts = db.prepare(`SELECT frame_key, count FROM frame_counts`);
    this.stmtClearNodes = db.prepare(`DELETE FROM graph_nodes`);
    this.stmtClearEdges = db.prepare(`DELETE FROM graph_edges`);
    this.stmtClearFrameCounts = db.prepare(`DELETE FROM frame_counts`);
  }

  // --- Nodes ---
  upsertNode(id: string, data: any): void {
    this.stmtUpsertNode.run(id, JSON.stringify(data));
  }

  getAllNodes(): GraphNodeData[] {
    const rows = this.stmtGetAllNodes.all() as { id: string; data_json: string }[];
    return rows.map((row) => ({
      id: row.id,
      data: JSON.parse(row.data_json),
    }));
  }

  deleteNode(id: string): void {
    this.stmtDeleteNode.run(id);
  }

  // --- Edges ---
  upsertEdge(id: string, data: any): void {
    this.stmtUpsertEdge.run(id, JSON.stringify(data));
  }

  getAllEdges(): GraphEdgeData[] {
    const rows = this.stmtGetAllEdges.all() as { id: string; data_json: string }[];
    return rows.map((row) => ({
      id: row.id,
      data: JSON.parse(row.data_json),
    }));
  }

  deleteEdge(id: string): void {
    this.stmtDeleteEdge.run(id);
  }

  // --- Frame counts ---
  incrementFrameCount(frameKey: string): void {
    this.stmtIncrementFrameCount.run(frameKey);
  }

  getFrameCount(frameKey: string): number {
    const row = this.stmtGetFrameCount.get(frameKey) as { count: number } | undefined;
    return row ? row.count : 0;
  }

  getAllFrameCounts(): Record<string, number> {
    const rows = this.stmtGetAllFrameCounts.all() as { frame_key: string; count: number }[];
    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.frame_key] = row.count;
    }
    return result;
  }

  // --- Clear ---
  clear(): void {
    this.stmtClearNodes.run();
    this.stmtClearEdges.run();
    this.stmtClearFrameCounts.run();
  }
}