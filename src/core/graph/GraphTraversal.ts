import { GraphStore } from './GraphStore';

export class GraphTraversal {
  constructor(private store: GraphStore) {}

  bfs(startId: string, direction: 'forward' | 'backward' = 'forward'): string[] {
    const visited = new Set<string>();
    const queue = [startId];
    const order: string[] = [];
    while (queue.length) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      order.push(id);
      const edges = direction === 'forward' ? this.store.getOutgoingEdges(id) : this.store.getIncomingEdges(id);
      for (const edge of edges) {
        const nextId = direction === 'forward' ? edge.data.to : edge.data.from;
        if (!visited.has(nextId)) queue.push(nextId);
      }
    }
    return order;
  }

  dfs(startId: string, direction: 'forward' | 'backward' = 'forward'): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    const dfsRec = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      order.push(id);
      const edges = direction === 'forward' ? this.store.getOutgoingEdges(id) : this.store.getIncomingEdges(id);
      for (const edge of edges) {
        const nextId = direction === 'forward' ? edge.data.to : edge.data.from;
        dfsRec(nextId);
      }
    };
    dfsRec(startId);
    return order;
  }
}