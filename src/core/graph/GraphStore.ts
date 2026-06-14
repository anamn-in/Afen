import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';

export class GraphStore {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private adjacencyOut: Map<string, Set<GraphEdge>> = new Map();
  private adjacencyIn: Map<string, Set<GraphEdge>> = new Map();

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    this.adjacencyOut.set(node.id, new Set());
    this.adjacencyIn.set(node.id, new Set());
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

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
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

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacencyOut.clear();
    this.adjacencyIn.clear();
  }
}