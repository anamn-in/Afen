# Afen Benchmarks

## Goals

| Dimension | What it measures |
|-----------|------------------|
| **Performance** | Graph build time, query execution latency (p50, p95, p99) |
| **Accuracy** | Precision, recall, F1 of root cause identification |
| **Scalability** | Memory usage and execution time with growing graph size |

## Running Benchmarks

```bash
npm run bench
```

## Benchmark Suites

### Graph Build

- Input: randomly generated causal graphs (100, 500, 1000, 2000, 5000 nodes).
- Metrics: build time (ms), memory usage (MB).

### Query Execution

- Commands tested: `TRACE`, `CAUSE`, `EXPLAIN`.
- Metrics: average latency, p95 latency, success rate.

### Reasoning Accuracy

- Method: inject known root causes, run KT analysis, compare with ground truth.
- Metrics: F1 score.

## Expected Results (typical)

| Nodes | Build time (ms) | BFS time (ms) | Memory (MB) |
|-------|----------------|---------------|-------------|
| 100   | < 1             | < 0.5         | < 0.5       |
| 500   | < 2             | < 1           | < 1         |
| 1000  | < 3             | < 2           | < 2         |
| 5000  | < 10            | < 5           | < 5         |

## Interpreting Results

- If build times exceed linear scaling, review graph implementation.
- If query latencies spike beyond expected ranges, check indexing or traversal.
- If accuracy drops below 90%, adjust reasoning rules or probabilities.