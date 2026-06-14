export interface GraphEdgeData {
  from: string;
  to: string;
  type: string;
  weight?: number;
  metadata?: Record<string, any>;
}

export class GraphEdge {
  constructor(public readonly id: string, public data: GraphEdgeData) {}
}