import { apiClient } from '../utils/apiClient';

export async function graphCommand(): Promise<void> {
  try {
    const data = await apiClient('GET', '/graph');
    // Type assertions for 'unknown' response
    const nodes = (data as any).nodes || [];
    const edges = (data as any).edges || [];
    console.log(`Graph nodes: ${nodes.length}, edges: ${edges.length}`);
    if (nodes.length > 0) {
      console.log('Nodes:');
      console.table(nodes.map((n: any) => ({
        ID: n.id,
        Label: n.data?.label || n.id,
        Vendor: n.data?.metadata?.isVendor ? 'Yes' : 'No',
      })));
    }
    if (edges.length > 0) {
      console.log('Edges:');
      console.table(edges.map((e: any) => ({
        ID: e.id,
        From: e.data?.from,
        To: e.data?.to,
        Type: e.data?.type,
      })));
    }
  } catch (err) {
    console.error('❌ Failed to fetch graph:', (err as Error).message);
    process.exit(1);
  }
}