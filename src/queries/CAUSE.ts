import { KTAnalysis } from '@core/engines/KTAnalysis';

export async function cause(fingerprint: string, deep: boolean = false, changes?: Record<string, any>): Promise<any> {
  const kt = new KTAnalysis();
  const result = deep ? kt.deepMode(fingerprint, changes || {}) : kt.fastMode(fingerprint);
  return {
    mode: result.mode,
    candidates: result.rootCauseCandidates,
    analysisTimeMs: result.analysisTimeMs
  };
}