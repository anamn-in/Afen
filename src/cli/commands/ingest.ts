import { apiClient } from '../utils/apiClient';
import { readFileSync } from 'fs';
import path from 'path';

export async function ingestCommand(filePath: string): Promise<void> {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const rawData = JSON.parse(readFileSync(absolutePath, 'utf-8'));
    const payload = {
      message: rawData.message || rawData.error || 'No message provided',
      errorType: rawData.errorType || rawData.type || 'UnknownError',
      stackTraceRaw: rawData.stackTraceRaw || rawData.stack || rawData.stacktrace || '',
      language: rawData.language || rawData.lang || 'javascript',
    };
    console.log('[DEBUG-CLI] Ingesting payload:', {
      hasStackTraceRaw: !!payload.stackTraceRaw,
      stackTraceRawLength: Array.isArray(payload.stackTraceRaw)
        ? payload.stackTraceRaw.length
        : typeof payload.stackTraceRaw === 'string'
          ? payload.stackTraceRaw.split('\n').length
          : 0,
      language: payload.language,
    });
    const result = await apiClient('POST', '/ingest', payload);
    console.log('✅ Ingested successfully.');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to ingest:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}