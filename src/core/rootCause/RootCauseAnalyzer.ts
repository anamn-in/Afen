import { GraphStore } from '../graph/GraphStore';
import { GraphTraversal } from '../graph/GraphTraversal';
import { RootCauseReport } from './RootCauseReport';
import { StackFrame } from '@models/uir/UIREvent';

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

  /**
   * Computes confidence for a root cause candidate based on:
   * - Frame position (closer to error origin -> higher)
   * - Vendor status (application frames preferred)
   * - Graph in‑degree (fewer incoming edges -> higher)
   * - Recurrence of this frame across all errors (higher recurrence -> higher confidence)
   */
  computeRootCauseForStack(
    stackFrames: StackFrame[],
    graph: GraphStore
  ): { frame: StackFrame; confidence: number; isVendor: boolean; recommendation: string } | null {
    if (!stackFrames.length) return null;

    // Build a map of frameKey -> node for quick lookup
    const nodeByFrameKey = new Map<string, { node: any; frame: StackFrame; index: number; isVendor: boolean }>();
    for (let i = 0; i < stackFrames.length; i++) {
      const frame = stackFrames[i];
      const key = `${frame.filename}|${frame.functionName}|${frame.lineNumber}`;
      const node = graph.getNodeByKey(key);
      const isVendor = this.isVendorFrame(frame);
      nodeByFrameKey.set(key, { node, frame, index: i, isVendor });
    }

    let bestScore = -1;
    let bestFrame: StackFrame | null = null;
    let bestIsVendor = false;

    for (const [key, entry] of nodeByFrameKey) {
      const { node, frame, index, isVendor } = entry;
      const depth = index; // position from innermost (0 is closest)
      const positionScore = 1 / (depth + 1);
      const vendorBonus = isVendor ? 0 : 0.3;
      const inDegree = node ? graph.getIncomingEdges(node.id).length : 0;
      const inDegreeScore = 1 / (inDegree + 1);
      const recurrence = graph.getFrameCount(key);
      const recurrenceScore = Math.min(1, recurrence / 10); // cap at 1

      const confidence = Math.min(1, positionScore + vendorBonus + inDegreeScore * 0.2 + recurrenceScore * 0.2);
      if (confidence > bestScore) {
        bestScore = confidence;
        bestFrame = frame;
        bestIsVendor = isVendor;
      }
    }

    if (!bestFrame) return null;

    const recommendation = `Investigate ${bestFrame.functionName} in ${bestFrame.filename} at line ${bestFrame.lineNumber}`;
    return {
      frame: bestFrame,
      confidence: Math.min(1, bestScore),
      isVendor: bestIsVendor,
      recommendation,
    };
  }

  private isVendorFrame(frame: StackFrame): boolean {
    const file = frame.filename.toLowerCase();
    if (file.includes('node_modules')) return true;
    const vendorPatterns = ['express', 'layer', 'router', 'next', 'koa', 'fastify', 'runtime'];
    for (const pattern of vendorPatterns) {
      if (file.includes(pattern)) return true;
    }
    return false;
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