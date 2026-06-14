export class ImpactReport {
  constructor(public readonly data: {
    rootNode: string;
    affectedNodes: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    totalImpactScore: number;
  }) {}

  toJSON() {
    return { ...this.data };
  }

  toString(): string {
    return `Impact Report:\nRoot: ${this.data.rootNode}\nAffected nodes: ${this.data.affectedNodes.length}\nSeverity: ${this.data.severity}\nScore: ${this.data.totalImpactScore}`;
  }
}