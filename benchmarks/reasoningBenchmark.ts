import { performance } from 'perf_hooks';

interface ReasoningTestCase {
  id: string;
  knownRootCause: string;
  candidates: Array<{ id: string; confidence: number }>;
}

interface ReasoningBenchmarkResult {
  testCase: string;
  predictedRootCause: string;
  expectedRootCause: string;
  correctnessScore: number;
  confidence: number;
  depth: number;
  analysisTimeMs: number;
}

class MockReasoningEngine {
  async analyze(
    candidates: Array<{ id: string; confidence: number }>,
    depth: number
  ): Promise<{ rootCause: string; confidence: number }> {
    await new Promise(r => setTimeout(r, 1));
    const ranked = [...candidates].sort((a, b) => b.confidence - a.confidence);
    const top = ranked[0];
    return { rootCause: top?.id ?? 'unknown', confidence: top?.confidence ?? 0 };
  }
}

function generateTestCases(): ReasoningTestCase[] {
  return [
    {
      id: 'case_1_simple_chain',
      knownRootCause: 'config_missing',
      candidates: [
        { id: 'config_missing', confidence: 0.92 },
        { id: 'network_timeout', confidence: 0.45 },
      ],
    },
    {
      id: 'case_2_multi_service',
      knownRootCause: 'auth_token_expired',
      candidates: [
        { id: 'auth_token_expired', confidence: 0.88 },
        { id: 'db_connection_lost', confidence: 0.6 },
        { id: 'rate_limit_exceeded', confidence: 0.3 },
      ],
    },
    {
      id: 'case_3_ambiguous',
      knownRootCause: 'memory_leak',
      candidates: [
        { id: 'memory_leak', confidence: 0.55 },
        { id: 'gc_pressure', confidence: 0.52 },
      ],
    },
  ];
}

export async function runReasoningBenchmark(): Promise<ReasoningBenchmarkResult[]> {
  const engine = new MockReasoningEngine();
  const testCases = generateTestCases();
  const results: ReasoningBenchmarkResult[] = [];

  for (const testCase of testCases) {
    const depth = testCase.candidates.length;
    const start = performance.now();
    const { rootCause, confidence } = await engine.analyze(testCase.candidates, depth);
    const analysisTimeMs = performance.now() - start;

    const correctnessScore = rootCause === testCase.knownRootCause ? 1 : 0;

    results.push({
      testCase: testCase.id,
      predictedRootCause: rootCause,
      expectedRootCause: testCase.knownRootCause,
      correctnessScore,
      confidence: parseFloat(confidence.toFixed(2)),
      depth,
      analysisTimeMs: parseFloat(analysisTimeMs.toFixed(2)),
    });
  }

  return results;
}
