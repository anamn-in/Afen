# Afen Architecture

Afen is built as a layered, modular system. Each layer has a clear responsibility and communicates through well‑defined interfaces.

## Layered Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Benchmarks & Tests                       │
└─────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────┐
│                       Query Layer (AQL)                      │
└─────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────┐
│                      Reasoning Engine                        │
│                 (KT fast/deep analysis)                      │
└─────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────┐
│                         Core                                 │
│        (Graph Engine, UIR Pipeline, Fingerprinting)          │
└─────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────┐
│                       Ingestion Layer                        │
│          (RuntimeCollector, RuntimeWatcher, API)             │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

- **API Layer** – Express server with `/ingest`, `/query`, `/report`, `/health`.
- **UIR Pipeline** – 5‑stage normalisation: stack parsing, cause‑chain unwrapping, path normalisation, volatility stripping, OpenTelemetry mapping.
- **Fingerprinting** – 3‑layer structural hashing (structural, contextual, system variant) + deduplication.
- **Graph Engine** – Builds causal graph, supports BFS/DFS, impact analysis, and clustering of related nodes.
- **Reasoning Engine** – Kepner‑Tregoe analysis (fast heuristic + deep change correlation), candidate ranking, benchmarked against known root-cause test cases.
- **Storage** – Pluggable adapters (SQLite default, PostgreSQL optional).
- **AQL** – Query language with `TRACE`, `CAUSE`, `EXPLAIN`, `COUNT`, `RANK`, `PREDICT`.
- **Integrations** – LSP, webhooks, OpenTelemetry exporters.
- **UI** – React dashboard with causal graph and AQL terminal.

## Benchmarking

Afen ships with a benchmark suite (`npm run bench`) covering three dimensions:

- **Graph Build** – measures clustering and graph construction time across increasing node counts (100–5000 nodes).
- **Query Execution** – measures average and p95 latency for `TRACE`, `CAUSE`, and `EXPLAIN` queries.
- **Reasoning Accuracy** – measures correctness of root-cause prediction against known test cases using a Kepner‑Tregoe–style confidence ranking.
```