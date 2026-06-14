import React, { useRef, useEffect } from 'react';

interface GraphNode {
  id: string;
  isCluster?: boolean;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface TraceGraphProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export const TraceGraph: React.FC<TraceGraphProps> = ({ nodes, edges }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width = canvas.clientWidth;
        const height = canvas.height = canvas.clientHeight;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#151515';
        ctx.fillRect(0, 0, width, height);

        // Simple force‑directed layout (mock)
        const positions = nodes.map((node: GraphNode, i: number) => ({
            x: 100 + (i * 50) % (width - 200),
            y: 100 + (i * 30) % (height - 200),
        }));

        ctx.beginPath();
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        edges.forEach((edge: GraphEdge) => {
            const fromIdx = nodes.findIndex((n: GraphNode) => n.id === edge.source);
            const toIdx = nodes.findIndex((n: GraphNode) => n.id === edge.target);
            if (fromIdx !== -1 && toIdx !== -1) {
                ctx.moveTo(positions[fromIdx].x, positions[fromIdx].y);
                ctx.lineTo(positions[toIdx].x, positions[toIdx].y);
                ctx.stroke();
            }
        });

        nodes.forEach((node: GraphNode, i: number) => {
            ctx.beginPath();
            ctx.arc(positions[i].x, positions[i].y, node.isCluster ? 12 : 8, 0, 2 * Math.PI);
            ctx.fillStyle = node.isCluster ? '#22c55e' : '#22d3ee';
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.fillText(node.id.slice(0, 8), positions[i].x + 10, positions[i].y + 4);
        });
    }, [nodes, edges]);

    return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', background: '#0f0f0f', borderRadius: '12px' }} />;
};