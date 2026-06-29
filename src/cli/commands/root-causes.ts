import { apiClient } from '../utils/apiClient.js';

interface RootCausesResponse {
  rootCauses: unknown[];
}

export async function rootCausesCommand(): Promise<void> {
  try {
    const data = await apiClient<RootCausesResponse>('GET', '/root-causes');
    console.log(JSON.stringify(data.rootCauses, null, 2));
  } catch (err) {
    console.error('❌ Failed to fetch root causes:', (err as Error).message);
    process.exit(1);
  }
}
