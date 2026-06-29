import { apiClient } from '../utils/apiClient.js';

interface ErrorResponse {
  error: unknown;
}

export async function errorCommand(id: string): Promise<void> {
  try {
    const data = await apiClient<ErrorResponse>('GET', `/errors/${id}`);
    console.log(JSON.stringify(data.error, null, 2));
  } catch (err) {
    console.error('❌ Failed to fetch error:', (err as Error).message);
    process.exit(1);
  }
}
