import { NormalizedUIREvent } from '@models/uir/UIREvent';

export interface StorageAdapter {
  insertEvent(event: NormalizedUIREvent): void;
  findEventsByFingerprint(fingerprint: string, limit?: number): Promise<NormalizedUIREvent[]>;
  getTimeSeries(fingerprint: string, startTime: number, endTime: number): Promise<{ timestamp: number; count: number }[]>;
  getFingerprintStats(fingerprint: string): Promise<{ count: number; first_seen: number; last_seen: number; resolved: number } | undefined>;
  updateFingerprintCount(fingerprint: string, timestamp: number): void;
  markFingerprintResolved(fingerprint: string): void;
  close(): void;
}