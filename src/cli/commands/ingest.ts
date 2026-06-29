import { apiClient } from '../utils/apiClient';
import { readFileSync } from 'fs';
import path from 'path';

export async function ingestCommand(filePath: string): Promise<void> {
  try {
    // Resolve the absolute path to the file
    const absolutePath = path.resolve(process.cwd(), filePath);

    // Read and parse the JSON file
    const rawData = JSON.parse(readFileSync(absolutePath, 'utf-8'));

    // --- EXPLICIT MAPPING: Ensure all required fields are present ---
    // No duplicate keys – the object is defined once.
    const payload = {
      message: rawData.message || rawData.error || 'No message provided',
      errorType: rawData.errorType || rawData.type || 'UnknownError',
      stackTraceRaw: rawData.stackTraceRaw || rawData.stack || rawData.stacktrace || '',
      language: rawData.language || rawData.lang || 'javascript',
    };

    // --- DEBUG: Log the payload being sent ---
    console.log('[DEBUG-CLI] Ingesting payload:', {
      hasStackTraceRaw: !!payload.stackTraceRaw,
      stackTraceRawLength: Array.isArray(payload.stackTraceRaw)
        ? payload.stackTraceRaw.length
        : typeof payload.stackTraceRaw === 'string'
          ? payload.stackTraceRaw.split('\n').length
          : 0,
      language: payload.language,
    });

    // Send the payload to the runtime API
    const result = await apiClient('POST', '/ingest', payload);
    console.log('✅ Ingested successfully.');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('❌ Failed to ingest:', (err as Error).message);
    process.exit(1);
  }
}