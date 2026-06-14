export class LikelihoodScore {
  constructor(public readonly value: number) {
    if (value < 0 || value > 1) throw new Error('Likelihood must be between 0 and 1');
  }

  static fromProbability(prob: number): LikelihoodScore {
    return new LikelihoodScore(Math.min(1, Math.max(0, prob)));
  }
}