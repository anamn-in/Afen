import { GraphStore } from '../graph/GraphStore';
import { BlastRadius } from './BlastRadius';
import { ImpactReport } from './ImpactReport';

export interface ImpactAnalysisInput {
  failedNodeId: string;
  severityThreshold?: number;
}

export class ImpactAnalyzer {
  constructor(private store: GraphStore, private blastRadius: BlastRadius) {}

  analyze(input: ImpactAnalysisInput): ImpactReport {
    const affectedNodes = this.blastRadius.calculate(input.failedNodeId);
    const severity = this.calculateSeverity(affectedNodes);
    const totalImpact = this.aggregateImpact(affectedNodes);
    return new ImpactReport({
      rootNode: input.failedNodeId,
      affectedNodes,
      severity,
      totalImpactScore: totalImpact,
    });
  }

  private calculateSeverity(affectedNodes: string[]): 'low' | 'medium' | 'high' | 'critical' {
    const count = affectedNodes.length;
    if (count === 0) return 'low';
    if (count <= 5) return 'medium';
    if (count <= 20) return 'high';
    return 'critical';
  }

  private aggregateImpact(affectedNodes: string[]): number {
    return affectedNodes.length;
  }
}