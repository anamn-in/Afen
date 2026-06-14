import { performance } from 'perf_hooks';

class QueryEngine {
  private _graph: any;

  constructor(_graph: any) {
    this._graph = _graph;
  }

  async trace(errorId: string, _maxDepth = 10): Promise<string[]> {
    await new Promise(r => setTimeout(r, 1));
    return [`${errorId}`, `cause_${errorId}`];
  }

  async cause(errorId: string): Promise<Array<{ id: string; confidence: number }>> {
    await new Promise(r => setTimeout(r, 1));
    return [{ id: `cause_${errorId}`, confidence: 0.95 }];
  }

  async explain(errorId: string): Promise<string> {
    await new Promise(r => setTimeout(r, 2));
    return `Explanation for ${errorId}: simulated root cause.`;
  }
}

interface QueryBenchmarkResult {
  queryType: string;
  avgLatencyMs: number;
  p95LatencyMs: number;
  successRate: number;
}

export async function runQueryBenchmark(): Promise<QueryBenchmarkResult[]> {
  const queryEngine = new QueryEngine(null);
  const queries = ['TRACE err_42', 'CAUSE err_42', 'EXPLAIN err_42'];
  const results: QueryBenchmarkResult[] = [];

  for (const q of queries) {
    const latencies: number[] = [];
    const iterations = 50;
    let successes = 0;
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      try {
        if (q.startsWith('TRACE')) await queryEngine.trace('err_42');
        else if (q.startsWith('CAUSE')) await queryEngine.cause('err_42');
        else await queryEngine.explain('err_42');
        successes++;
        latencies.push(performance.now() - start);
      } catch {
        // failure counted as not success
      }
    }
    latencies.sort((a, b) => a - b);
    const avg = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || avg;
    results.push({
      queryType: q,
      avgLatencyMs: parseFloat(avg.toFixed(2)),
      p95LatencyMs: parseFloat(p95.toFixed(2)),
      successRate: successes / iterations,
    });
  }
  return results;
}