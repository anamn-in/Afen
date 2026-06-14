import { GraphStore } from '../graph/GraphStore';
import { GraphTraversal } from '../graph/GraphTraversal';

export class BlastRadius {
  private traversal: GraphTraversal;
  constructor(private store: GraphStore) {
    this.traversal = new GraphTraversal(store);
  }

  calculate(failedNodeId: string, maxDepth = 10): string[] {
    const bfsOrder = this.traversal.bfs(failedNodeId, 'forward');
    const depthMap = new Map<string, number>();
    depthMap.set(failedNodeId, 0);
    const result: string[] = [];
    for (const nodeId of bfsOrder) {
      const depth = depthMap.get(nodeId) ?? 0;
      if (depth <= maxDepth && nodeId !== failedNodeId) {
        result.push(nodeId);
      }
      for (const edge of this.store.getOutgoingEdges(nodeId)) {
        const child = edge.data.to;
        if (!depthMap.has(child)) {
          depthMap.set(child, depth + 1);
        }
      }
    }
    return result;
  }
}