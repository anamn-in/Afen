import { GraphStore } from '../graph/GraphStore';
import { GraphTraversal } from '../graph/GraphTraversal';
import { RootCauseReport } from './RootCauseReport';
import { StackFrame } from '@models/uir/UIREvent';
import { FrameClassifier } from './FrameClassifier';

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
      // REMOVED: if (nodeId === errorNodeId) continue;  // <-- FIX: do not skip error node

      // FIX: depth is 0 for the error node itself, otherwise compute distance
      const depth = nodeId === errorNodeId ? 0 : this.getDepth(errorNodeId, nodeId);
      if (depth > maxDepth) continue;

      // Extract stack frames from node metadata
      const node = this.store.getNode(nodeId);
      let stackFrames: StackFrame[] = [];
      if (node && node.data.metadata) {
        const meta = node.data.metadata;
        if (meta.causeChain && Array.isArray(meta.causeChain.stackFrames)) {
          stackFrames = meta.causeChain.stackFrames;
        } else if (Array.isArray(meta.stackFrames)) {
          stackFrames = meta.stackFrames;
        }
      }

      let confidence = 0.1;
      let evidence: string[] = ['no direct causes found; root cause may be the error itself'];

      if (stackFrames.length > 0) {
        const result = FrameClassifier.classifyStack(stackFrames);
        confidence = result.confidence;
        evidence = result.evidence;
      } else {
        // Fallback: use incoming graph edges to infer an app-owned frame
        const incomingEdges = this.store.getIncomingEdges(nodeId);
        for (const edge of incomingEdges) {
          const fromNode = this.store.getNode(edge.data.from);
          if (fromNode && fromNode.data.metadata) {
            const fromMeta = fromNode.data.metadata;
            if (fromMeta.label && !fromMeta.label.includes('node_modules')) {
              confidence = 0.5;
              evidence = [`app‑owned source frame: ${fromMeta.label}`];
              break;
            }
          }
        }
      }

      // Apply depth penalty (closer to error -> higher confidence)
      const depthPenalty = Math.exp(-depth / 3);
      const adjustedConfidence = Math.min(1, confidence * depthPenalty);

      if (adjustedConfidence >= minConfidence) {
        candidates.push({
          nodeId,
          score: adjustedConfidence * (1 - depth / maxDepth),
          confidence: adjustedConfidence,
          evidence,
        });
      }
    }

    // Ensure we always have at least one candidate (fallback to error node)
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

  // --- The rest of the file remains unchanged ---
  // computeRootCauseForStack(), isVendorFrame(), getDepth(), calculateConfidence()
  // are all unchanged from the previous version.

  computeRootCauseForStack(
    stackFrames: StackFrame[],
    graph: GraphStore
  ): { frame: StackFrame; confidence: number; isVendor: boolean; recommendation: string } | null {
    if (!stackFrames.length) return null;

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
      const depth = index;
      const positionScore = 1 / (depth + 1);
      const vendorBonus = isVendor ? 0 : 0.3;
      const inDegree = node ? graph.getIncomingEdges(node.id).length : 0;
      const inDegreeScore = 1 / (inDegree + 1);
      const recurrence = graph.getFrameCount(key);
      const recurrenceScore = Math.min(1, recurrence / 10);

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