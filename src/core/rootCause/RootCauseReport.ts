export class RootCauseReport {
  constructor(
    public readonly errorNodeId: string,
    public readonly rankedCandidates: Array<{ nodeId: string; score: number; confidence: number; evidence: string[] }>
  ) {}

  getTopCandidate() {
    return this.rankedCandidates[0];
  }

  toJSON() {
    return {
      errorNodeId: this.errorNodeId,
      candidates: this.rankedCandidates,
    };
  }
}