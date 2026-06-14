import { LikelihoodScore } from './LikelihoodScore';
import { SeverityScore } from './SeverityScore';

export interface ScoreInput {
  likelihood: number;
  severity: number;
}

export class Scorer {
  computeRiskScore(likelihood: LikelihoodScore, severity: SeverityScore): number {
    return (likelihood.value * severity.value) / 10;
  }

  computeFromRaw(input: ScoreInput): number {
    const l = new LikelihoodScore(input.likelihood);
    const s = new SeverityScore(input.severity);
    return this.computeRiskScore(l, s);
  }
}