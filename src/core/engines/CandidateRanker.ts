export interface RankedCandidate {
  nodeId: string;
  score: number;
  frequency: number;
  impactRadius: number;
  proximity: number;
}

export class CandidateRanker {
  rank(candidates: RankedCandidate[]): RankedCandidate[] {
    const scored = candidates.map(c => ({
      ...c,
      weightedScore: (c.frequency * 0.5) + (c.impactRadius * 0.3) + (c.proximity * 0.2),
    }));
    return scored.sort((a, b) => b.weightedScore - a.weightedScore);
  }
}