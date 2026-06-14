export class DependencyGraph<T = any> {
  private nodes: Map<string, T> = new Map();
  private dependencies: Map<string, Set<string>> = new Map();
  private dependents: Map<string, Set<string>> = new Map();

  addNode(id: string, data?: T): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, data as T);
      this.dependencies.set(id, new Set());
      this.dependents.set(id, new Set());
    }
  }

  addDependency(from: string, to: string): void {
    if (!this.nodes.has(from) || !this.nodes.has(to)) {
      throw new Error(`Node ${from} or ${to} not found`);
    }
    this.dependencies.get(from)!.add(to);
    this.dependents.get(to)!.add(from);
  }

  getDirectDependencies(nodeId: string): Set<string> {
    return new Set(this.dependencies.get(nodeId) || []);
  }

  getDirectDependents(nodeId: string): Set<string> {
    return new Set(this.dependents.get(nodeId) || []);
  }

  getTransitiveDependencies(nodeId: string): Set<string> {
    const result = new Set<string>();
    const stack = [nodeId];
    const visited = new Set<string>();
    while (stack.length) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const deps = this.dependencies.get(current) || new Set();
      for (const dep of deps) {
        result.add(dep);
        if (!visited.has(dep)) stack.push(dep);
      }
    }
    result.delete(nodeId);
    return result;
  }

  getAllNodeIds(): string[] {
    return Array.from(this.nodes.keys());
  }

  topologicalSort(): string[] {
    const inDegree = new Map<string, number>();
    for (const id of this.nodes.keys()) {
      inDegree.set(id, this.dependents.get(id)?.size || 0);
    }
    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }
    const order: string[] = [];
    while (queue.length) {
      const node = queue.shift()!;
      order.push(node);
      for (const dep of this.dependencies.get(node) || []) {
        const newDeg = inDegree.get(dep)! - 1;
        inDegree.set(dep, newDeg);
        if (newDeg === 0) queue.push(dep);
      }
    }
    if (order.length !== this.nodes.size) {
      throw new Error('Cycle detected');
    }
    return order;
  }
}