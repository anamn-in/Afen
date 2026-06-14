import { GraphStore } from '../graph/GraphStore';
import { GraphTraversal } from '../graph/GraphTraversal';
import { RootCauseReport } from './RootCauseReport';

export interface RootCauseAnalysisInput {
  errorNodeId: string;
  maxDepth?: number;
  minConfidence?: number;
}

export class RootCauseAnalyzer {
  private traversal: GraphTraversal;
  constructor(private store: GraphStore) {
    this.traversal = new GraphTraversal(store);
  }

  analyze(input: RootCauseAnalysisInput): RootCauseReport {
    const { errorNodeId, maxDepth = 10, minConfidence = 0.0 } = input;
    const backwardNodes = this.traversal.bfs(errorNodeId, 'backward');
    const candidates: Array<{ nodeId: string; score: number; confidence: number; evidence: string[] }> = [];
    for (const nodeId of backwardNodes) {
      if (nodeId === errorNodeId) continue;
      const depth = this.getDepth(errorNodeId, nodeId);
      if (depth > maxDepth) continue;
      const confidence = this.calculateConfidence(nodeId, depth);
      if (confidence < minConfidence) continue;
      candidates.push({
        nodeId,
        score: confidence * (1 - depth / maxDepth),
        confidence,
        evidence: [`causal path length ${depth}`],
      });
    }
    if (candidates.length === 0) {
      candidates.push({
        nodeId: errorNodeId,
        score: 0.1,
        confidence: 0.1,
        evidence: ['no direct causes found; root cause may be the error itself'],
      });
    }
    const ranked = candidates.sort((a, b) => b.score - a.score);
    return new RootCauseReport(errorNodeId, ranked);
  }

  private getDepth(fromId: string, toId: string): number {
    const visited = new Map<string, number>();
    const queue = [{ id: fromId, dist: 0 }];
    while (queue.length) {
      const { id, dist } = queue.shift()!;
      if (id === toId) return dist;
      if (visited.has(id)) continue;
      visited.set(id, dist);
      for (const edge of this.store.getIncomingEdges(id)) {
        const prev = edge.data.from;
        if (!visited.has(prev)) {
          queue.push({ id: prev, dist: dist + 1 });
        }
      }
    }
    return Infinity;
  }

  private calculateConfidence(_nodeId: string, depth: number): number {
    return Math.exp(-depth / 3);
  }
}