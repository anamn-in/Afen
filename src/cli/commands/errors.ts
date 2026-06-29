import { apiClient } from '../utils/apiClient';

export async function errorsCommand(): Promise<void> {
  try {
    const data = await apiClient('GET', '/errors');
    // Type assertion to handle 'unknown' response
    const errors = (data as any).errors || [];
    if (errors.length === 0) {
      console.log('Found 0 errors.');
      return;
    }
    console.log(`Found ${errors.length} errors:`);
    console.table(errors.map((e: any) => ({
      ID: e.id,
      Type: e.errorType,
      Message: e.message.substring(0, 60) + (e.message.length > 60 ? '...' : ''),
      Language: e.sourceLanguage || e.language,
      'Ingested At': new Date(e.ingestedAt).toLocaleString(),
    })));
  } catch (err) {
    console.error('❌ Failed to fetch errors:', (err as Error).message);
    process.exit(1);
  }
}