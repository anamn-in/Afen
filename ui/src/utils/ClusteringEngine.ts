export interface ClusteredNode {
    id: string;
    groupId?: string;
    isCluster: boolean;
    children?: string[];
    x?: number;
    y?: number;
}

export interface ClusteredEdge {
    source: string;
    target: string;
}

export class ClusteringEngine {
    cluster(nodes: any[], edges: any[]): { nodes: ClusteredNode[]; edges: ClusteredEdge[] } {
        const groups = new Map<string, string[]>();
        for (const node of nodes) {
            const fingerprint = node.fingerprint?.structural || node.id;
            if (!groups.has(fingerprint)) groups.set(fingerprint, []);
            groups.get(fingerprint)!.push(node.id);
        }

        const clusteredNodes: ClusteredNode[] = [];
        const clusterMap = new Map<string, string>();

        for (const [group, children] of groups.entries()) {
            if (children.length > 1) {
                const clusterId = `cluster:${group}`;
                clusteredNodes.push({ id: clusterId, isCluster: true, children, groupId: group });
                for (const child of children) clusterMap.set(child, clusterId);
            } else if (children.length === 1) {
                const originalNode = nodes.find(n => n.id === children[0]);
                clusteredNodes.push({ id: children[0], isCluster: false, ...originalNode });
            }
        }

        const clusteredEdges: ClusteredEdge[] = [];
        for (const edge of edges) {
            const source = clusterMap.get(edge.source) || edge.source;
            const target = clusterMap.get(edge.target) || edge.target;
            if (source !== target) clusteredEdges.push({ source, target });
        }

        return { nodes: clusteredNodes, edges: clusteredEdges };
    }
}