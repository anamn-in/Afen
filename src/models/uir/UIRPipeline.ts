import crypto from 'crypto';
import { RawErrorPayload, NormalizedUIREvent } from './UIREvent';
import { CauseChainUnwrapper } from './CauseChainUnwrapper';
import { PathNormalizer } from './PathNormalizer';
import { VolatilityStripper } from './VolatilityStripper';
import { OTelMapper } from './OTelMapper';
import { Fingerprinter } from '@core/engines/Fingerprinter';
import { Deduplicator } from '@core/engines/Deduplicator';
import { EventDao } from '@storage/daos/EventDao';

export class UIRPipeline {
  private deduplicator: Deduplicator;
  private eventDao: EventDao | null = null;

  constructor() {
    this.deduplicator = new Deduplicator();
  }

  private getEventDao(): EventDao {
    if (!this.eventDao) {
      this.eventDao = new EventDao();
    }
    return this.eventDao;
  }

  async processRawPayload(payload: RawErrorPayload): Promise<NormalizedUIREvent> {
    // --- DEBUG: Log incoming payload structure ---
    console.log('[DEBUG-PIPELINE] Payload Received:', {
      hasStack: !!payload.stackTraceRaw,
      stackLength: Array.isArray(payload.stackTraceRaw)
        ? payload.stackTraceRaw.length
        : typeof payload.stackTraceRaw === 'string'
        ? payload.stackTraceRaw.split('\n').length
        : 0,
      language: payload.language,
      message: payload.message?.substring(0, 50),
    });

    // --- DEBUG: Log the raw stack payload (first 100 chars) ---
    const rawStack = Array.isArray(payload.stackTraceRaw)
      ? payload.stackTraceRaw.join('\n')
      : payload.stackTraceRaw || '';
    console.log('[DEBUG] Normalizing stack (first 100 chars):', JSON.stringify(rawStack.substring(0, 100)));

    const causeChain = CauseChainUnwrapper.unwrap(payload);
    const normalizedStack = causeChain.stackFrames.map(frame => ({
      ...frame,
      filename: PathNormalizer.normalize(frame.filename),
    }));
    const strippedStack = normalizedStack.map(frame => ({
      ...frame,
      filename: VolatilityStripper.strip(frame.filename),
      functionName: VolatilityStripper.strip(frame.functionName),
      raw: VolatilityStripper.strip(frame.raw),
    }));
    const strippedMessage = VolatilityStripper.strip(payload.message);
    const partial: Partial<NormalizedUIREvent> = {
      id: crypto.randomUUID(),
      message: strippedMessage,
      errorType: payload.errorType,
      causeChain: { ...causeChain, stackFrames: strippedStack },
      environmentSnapshot: payload.environment,
      processState: payload.processInfo,
      ingestedAt: Date.now(),
      sourceLanguage: payload.language,
      normalizedStack: strippedStack,
    };
    const fingerprints = Fingerprinter.computeLayers(partial);
    partial.fingerprint = fingerprints;
    this.deduplicator.record(fingerprints.systemVariant);
    const otelAttrs = OTelMapper.toOTelAttributes(partial);
    const finalEvent = { ...(partial as NormalizedUIREvent), otelAttributes: otelAttrs };
    this.getEventDao().insert(finalEvent);
    return finalEvent;
  }

  getDeduplicationCount(fingerprint: string): number {
    return this.deduplicator.getCount(fingerprint);
  }
}