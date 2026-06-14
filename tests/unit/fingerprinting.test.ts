import { Fingerprinter } from '@core/engines/Fingerprinter';

describe('Fingerprinter', () => {
  const baseEvent = {
    normalizedStack: [{ functionName: 'foo', filename: 'app.js', lineNumber: 10, raw: '', language: 'nodejs' }],
    message: 'test error',
    errorType: 'TypeError',
  };

  it('produces same structural fingerprint for identical stacks', () => {
    const f1 = Fingerprinter.computeLayers({ ...baseEvent });
    const f2 = Fingerprinter.computeLayers({ ...baseEvent });
    expect(f1.structural).toBe(f2.structural);
  });

  it('different stacks produce different structural fingerprints', () => {
    const f1 = Fingerprinter.computeLayers({ ...baseEvent });
    const f2 = Fingerprinter.computeLayers({
      ...baseEvent,
      normalizedStack: [{ functionName: 'bar', filename: 'app.js', lineNumber: 20, raw: '', language: 'nodejs' }],
    });
    expect(f1.structural).not.toBe(f2.structural);
  });

  it('different messages produce different contextual fingerprints', () => {
    const f1 = Fingerprinter.computeLayers({ ...baseEvent, message: 'first' });
    const f2 = Fingerprinter.computeLayers({ ...baseEvent, message: 'second' });
    expect(f1.contextual).not.toBe(f2.contextual);
  });
});