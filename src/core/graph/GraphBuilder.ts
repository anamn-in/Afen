import { GraphNode, GraphNodeData } from './GraphNode';
import { GraphEdge, GraphEdgeData } from './GraphEdge';
import { GraphStore } from './GraphStore';

export interface BuildInput {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

export class GraphBuilder {
  constructor(private store: GraphStore) {}

  build(input: BuildInput): void {
    for (const nodeData of input.nodes) {
      const node = new GraphNode(nodeData.id, nodeData);
      this.store.addNode(node);
    }
    for (const edgeData of input.edges) {
      const edgeId = `${edgeData.from}->${edgeData.to}:${edgeData.type}`;
      const edge = new GraphEdge(edgeId, edgeData);
      this.store.addEdge(edge);
    }
  }

  rebuild(input: BuildInput): void {
    this.store.clear();
    this.build(input);
  }
}