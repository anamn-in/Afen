import { performance } from 'perf_hooks';

class MockClusteringEngine {
  cluster(nodes: any[], edges: any[]) {
    const groups = new Map<string, string[]>();
    for (const node of nodes) {
      const fp = node.fingerprint?.structural || node.id;
      if (!groups.has(fp)) groups.set(fp, []);
      groups.get(fp)!.push(node.id);
    }
    const clusteredNodes: any[] = [];
    const clusterMap = new Map<string, string>();
    for (const [group, children] of groups.entries()) {
      if (children.length > 1) {
        const clusterId = `cluster:${group}`;
        clusteredNodes.push({ id: clusterId, isCluster: true, children, groupId: group });
        for (const child of children) clusterMap.set(child, clusterId);
      } else if (children.length === 1) {
        const original = nodes.find(n => n.id === children[0]);
        clusteredNodes.push({ ...original, isCluster: false });
      }
    }
    const clusteredEdges = edges.map(edge => ({
      source: clusterMap.get(edge.source) || edge.source,
      target: clusterMap.get(edge.target) || edge.target,
    })).filter(e => e.source !== e.target);
    return { nodes: clusteredNodes, edges: clusteredEdges };
  }
}

function generateGraphData(nodeCount: number, edgeFactor = 2) {
  const nodes = [];
  const edges = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `n${i}`,
      fingerprint: { structural: i < nodeCount / 2 ? 'groupA' : 'groupB' },
    });
  }
  for (let i = 0; i < nodeCount; i++) {
    for (let j = 1; j <= edgeFactor; j++) {
      const target = (i + j) % nodeCount;
      if (target !== i) {
        edges.push({ source: `n${i}`, target: `n${target}` });
      }
    }
  }
  return { nodes, edges };
}

export async function runGraphBenchmark(): Promise<any[]> {
  const sizes = [100, 500, 1000, 2000, 5000];
  const results = [];
  const clusteringEngine = new MockClusteringEngine();

  for (const size of sizes) {
    const { nodes, edges } = generateGraphData(size);
    const start = performance.now();
    const clustered = clusteringEngine.cluster(nodes, edges);
    const duration = performance.now() - start;
    results.push({
      nodes: size,
      edges: edges.length,
      clusterTimeMs: duration,
      clusters: clustered.nodes.length,
    });
  }
  return results;
}