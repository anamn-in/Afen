import { EventDao } from '@storage/daos/EventDao';

export async function explain(fingerprint: string): Promise<string> {
  const dao = new EventDao();
  const events = dao.findByFingerprint(fingerprint, 1);
  if (events.length === 0) return 'No events found for this fingerprint.';
  const event = events[0];
  return `Error type: ${event.errorType}. First seen: ${new Date(event.ingestedAt).toISOString()}. Stack top: ${event.normalizedStack[0]?.functionName || 'unknown'}. Possible root cause: ${event.normalizedStack[0]?.filename || 'unknown'}.`;
}