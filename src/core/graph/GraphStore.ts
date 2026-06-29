import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';

export class GraphStore {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private adjacencyOut: Map<string, Set<GraphEdge>> = new Map();
  private adjacencyIn: Map<string, Set<GraphEdge>> = new Map();
  private frameCounts: Map<string, number> = new Map();

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    this.adjacencyOut.set(node.id, new Set());
    this.adjacencyIn.set(node.id, new Set());
  }

  removeNode(id: string): void {
    this.nodes.delete(id);
    this.adjacencyOut.delete(id);
    this.adjacencyIn.delete(id);
    // Remove all edges connected to this node
    for (const [edgeId, edge] of this.edges.entries()) {
      if (edge.data.from === id || edge.data.to === id) {
        this.edges.delete(edgeId);
      }
    }
  }

  addEdge(edge: GraphEdge): void {
    this.edges.set(edge.id, edge);
    const from = edge.data.from;
    const to = edge.data.to;
    if (!this.adjacencyOut.has(from)) this.adjacencyOut.set(from, new Set());
    if (!this.adjacencyIn.has(to)) this.adjacencyIn.set(to, new Set());
    this.adjacencyOut.get(from)!.add(edge);
    this.adjacencyIn.get(to)!.add(edge);
  }

  removeEdge(id: string): void {
    const edge = this.edges.get(id);
    if (!edge) return;
    this.edges.delete(id);
    const from = edge.data.from;
    const to = edge.data.to;
    this.adjacencyOut.get(from)?.delete(edge);
    this.adjacencyIn.get(to)?.delete(edge);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getNodeByKey(key: string): GraphNode | undefined {
    for (const node of this.nodes.values()) {
      if (node.data.metadata?.frameKey === key) {
        return node;
      }
    }
    return undefined;
  }

  getOutgoingEdges(nodeId: string): GraphEdge[] {
    return Array.from(this.adjacencyOut.get(nodeId) || []);
  }

  getIncomingEdges(nodeId: string): GraphEdge[] {
    return Array.from(this.adjacencyIn.get(nodeId) || []);
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  incrementFrameCount(key: string): void {
    const current = this.frameCounts.get(key) || 0;
    this.frameCounts.set(key, current + 1);
  }

  getFrameCount(key: string): number {
    return this.frameCounts.get(key) || 0;
  }

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacencyOut.clear();
    this.adjacencyIn.clear();
    this.frameCounts.clear();
  }
}