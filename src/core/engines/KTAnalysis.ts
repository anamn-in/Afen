import { EventDao } from '@storage/daos/EventDao';
import { FingerprintDao } from '@storage/daos/FingerprintDao';
import { NormalizedUIREvent } from '@models/uir/UIREvent';

export interface KTResult {
  rootCauseCandidates: Array<{ nodeId: string; confidence: number; evidence: string[] }>;
  mode: 'fast' | 'deep';
  analysisTimeMs: number;
}

export class KTAnalysis {
  private eventDao = new EventDao();
  private fingerprintDao = new FingerprintDao();

  fastMode(fingerprint: string): KTResult {
    const start = Date.now();
    const events = this.eventDao.findByFingerprint(fingerprint, 10);
    if (events.length === 0) {
      return {
        rootCauseCandidates: [{ nodeId: 'unknown', confidence: 0.5, evidence: ['No historical data'] }],
        mode: 'fast',
        analysisTimeMs: Date.now() - start,
      };
    }
    const candidates = events.map((e: NormalizedUIREvent) => ({
      nodeId: e.normalizedStack[0]?.filename || 'unknown',
      confidence: 0.8,
      evidence: [`Historical recurrence detected (${events.length} occurrences)`],
    }));
    return {
      rootCauseCandidates: candidates.slice(0, 3),
      mode: 'fast',
      analysisTimeMs: Date.now() - start,
    };
  }

  deepMode(fingerprint: string, changes: Record<string, any>): KTResult {
    const start = Date.now();
    const stats = this.fingerprintDao.getStats(fingerprint);
    const events = this.eventDao.findByFingerprint(fingerprint, 20);
    if (events.length === 0) {
      return {
        rootCauseCandidates: [{ nodeId: 'unknown', confidence: 0.4, evidence: ['No data for deep analysis'] }],
        mode: 'deep',
        analysisTimeMs: Date.now() - start,
      };
    }
    const candidates = events.slice(0, 5).map((e: NormalizedUIREvent) => ({
      nodeId: e.normalizedStack[0]?.filename || 'unknown',
      confidence: 0.85,
      evidence: [`Change detected: ${Object.keys(changes).join(', ')}`, `Frequency: ${stats?.count || 1}`],
    }));
    return {
      rootCauseCandidates: candidates,
      mode: 'deep',
      analysisTimeMs: Date.now() - start,
    };
  }
}