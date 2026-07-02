import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';
import { GraphDao } from '../../storage/daos/GraphDao';

export class GraphStore {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private dao?: GraphDao;

  constructor(dao?: GraphDao) {
    this.dao = dao;
    if (this.dao) {
      this.loadFromDb();
    }
  }

  loadFromDb(): void {
    if (!this.dao) return;

    for (const { id, data } of this.dao.getAllNodes()) {
      this.nodes.set(id, data as GraphNode);
    }

    for (const { id, data } of this.dao.getAllEdges()) {
      this.edges.set(id, data as GraphEdge);
    }
  }

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    this.dao?.upsertNode(node.id, node);
    this.dao?.checkpoint();
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  removeNode(id: string): void {
    this.nodes.delete(id);
    this.dao?.deleteNode(id);
    this.dao?.checkpoint();
  }

  addEdge(edge: GraphEdge): void {
    this.edges.set(edge.id, edge);
    this.dao?.upsertEdge(edge.id, edge);
    this.dao?.checkpoint();
  }

  getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }

  getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  removeEdge(id: string): void {
    this.edges.delete(id);
    this.dao?.deleteEdge(id);
    this.dao?.checkpoint();
  }

  incrementFrameCount(frameKey: string): void {
    this.dao?.incrementFrameCount(frameKey);
  }

  getFrameCount(frameKey: string): number {
    return this.dao?.getFrameCount(frameKey) ?? 0;
  }

  getAllFrameCounts(): Record<string, number> {
    return this.dao?.getAllFrameCounts() ?? {};
  }

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.dao?.clear();
  }

  getOutgoingEdges(nodeId: string): GraphEdge[] {
    return this.getAllEdges().filter(e => e.data.from === nodeId);
  }

  getIncomingEdges(nodeId: string): GraphEdge[] {
    return this.getAllEdges().filter(e => e.data.to === nodeId);
  }

  getNodeByKey(key: string): GraphNode | undefined {
    return this.getAllNodes().find(n => (n as any).key === key);
  }
}