import { EventDao } from '@storage/daos/EventDao';
import { NormalizedUIREvent } from '@models/uir/UIREvent';

export async function trace(fingerprint: string): Promise<any> {
  const dao = new EventDao();
  const events = dao.findByFingerprint(fingerprint, 50);
  const chain = events.map((e: NormalizedUIREvent) => ({
    id: e.id,
    timestamp: e.ingestedAt,
    stack: e.normalizedStack.map((f) => f.functionName)
  }));
  return { chain, count: chain.length };
}