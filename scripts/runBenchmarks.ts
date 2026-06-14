#!/usr/bin/env ts-node
import { runGraphBenchmark } from '../benchmarks/graphBuild.test';
import { runQueryBenchmark } from '../benchmarks/queryExec.test';
import { runReasoningBenchmark } from '../benchmarks/reasoningBenchmark';
import { DialectClient } from '../src/storage/DialectClient';
import { createTablesSQL } from '../src/storage/Schema';

async function runBenchmarks() {
  const client = DialectClient.getInstance(':memory:');
  client.getDB().exec(createTablesSQL);
  console.log('[runBenchmarks] Schema initialised for in-memory DB\n');

  console.log('=== Afen Benchmarks ===\n');

  console.log('📊 Graph Build Benchmark');
  const graphResults = await runGraphBenchmark();
  console.table(graphResults);
  console.log('');

  console.log('⚡ Query Execution Benchmark');
  const queryResults = await runQueryBenchmark();
  const avgLatency = queryResults.length > 0 ? queryResults[0].avgLatencyMs : 0;
  console.log(`   Average latency: ${avgLatency.toFixed(2)}ms`);
  console.table(queryResults);
  console.log('');

  console.log('🎯 Reasoning Accuracy Benchmark');
  const reasoningResults = await runReasoningBenchmark();
  const first = reasoningResults[0];
  console.log(`   Precision: ${first?.correctnessScore ?? 0}, Depth: ${first?.depth ?? 0}`);
  console.table(reasoningResults);
  console.log('');

  console.log('✅ Benchmark suite completed.');
}

runBenchmarks().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});