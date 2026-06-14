import { DependencyGraph } from './DependencyGraph';

export interface ResolvedDependency {
  id: string;
  resolutionOrder: string[];
  missingDependencies: string[];
}

export class DependencyResolver {
  constructor(private graph: DependencyGraph) {}

  resolve(targetId: string): ResolvedDependency {
    if (!this.graph.getAllNodeIds().includes(targetId)) {
      throw new Error(`Node ${targetId} not found`);
    }
    const transitive = this.graph.getTransitiveDependencies(targetId);
    const allNodes = this.graph.getAllNodeIds();
    const missing = Array.from(transitive).filter(id => !allNodes.includes(id));
    let resolutionOrder: string[] = [];
    try {
      const fullOrder = this.graph.topologicalSort();
      const relevant = new Set([targetId, ...transitive]);
      resolutionOrder = fullOrder.filter(id => relevant.has(id));
    } catch {
      resolutionOrder = [targetId, ...transitive];
    }
    return { id: targetId, resolutionOrder, missingDependencies: missing };
  }

  resolveAll(): string[] {
    return this.graph.topologicalSort();
  }
}