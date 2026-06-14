export class SeverityScore {
  constructor(public readonly value: number) {
    if (value < 0 || value > 10) throw new Error('Severity must be between 0 and 10');
  }

  static fromImpact(impactCount: number): SeverityScore {
    const normalized = Math.min(10, impactCount / 10);
    return new SeverityScore(normalized);
  }
}