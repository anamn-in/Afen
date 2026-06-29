import { apiClient } from '../utils/apiClient';

export async function queryCommand(aql: string): Promise<void> {
  try {
    const data = await apiClient('POST', '/query', { query: aql });
    console.log(JSON.stringify(data, null, 2));
    
    // Explicitly terminate to drop lingering client-side socket references
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to execute query:', (err as Error).message);
    process.exit(1);
  }
}