export interface GraphNodeData {
  id: string;
  label?: string;
  type: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export class GraphNode {
  constructor(public readonly id: string, public data: GraphNodeData) {}

  updateMetadata(meta: Record<string, any>): void {
    this.data.metadata = { ...this.data.metadata, ...meta };
  }
}