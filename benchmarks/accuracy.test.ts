import { UIRPipeline } from '@models/uir/UIRPipeline';
import { generateMockPayload } from '../tests/helpers/mockPayloads';
import { VolatilityStripper } from '@models/uir/VolatilityStripper';

export async function runReasoningBenchmark(): Promise<any[]> {
  const pipeline = new UIRPipeline();
  const languages = ['javascript', 'python', 'go'];
  const results = [];

  for (const lang of languages) {
    const payload = generateMockPayload(lang, `Test error in ${lang}`);
    const start = Date.now();
    const uirEvent = await pipeline.processRawPayload(payload);
    const duration = Date.now() - start;
    results.push({
      language: lang,
      processTimeMs: duration,
      stackLength: uirEvent.normalizedStack.length,
      fingerprint: uirEvent.fingerprint.structural,
    });
  }
  return results;
}

// Additional accuracy test: volatility stripping
export function testVolatilityStripping() {
  const inputs = [
    'Error at 0x7fff5fbff618: memory fault',
    'pid=12345 thread=67890 crashed',
    'Temp file /tmp/abc123/config.yaml not found',
    'Timestamp 1700000000000 exceeds limit',
  ];
  const stripped = inputs.map(VolatilityStripper.strip);
  return { inputs, stripped };
}