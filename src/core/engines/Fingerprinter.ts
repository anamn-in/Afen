import crypto from 'crypto';
import { VolatilityStripper } from '@models/uir/VolatilityStripper';
import { NormalizedUIREvent, StackFrame } from '@models/uir/UIREvent';

export class Fingerprinter {
  static computeLayers(uir: Partial<NormalizedUIREvent>): {
    structural: string;
    contextual: string;
    systemVariant: string;
  } {
    const structuralParts = (uir.normalizedStack || [])
      .map((f: StackFrame) => `${f.functionName}@${f.filename}:${f.lineNumber}`)
      .join('|');
    const structuralHash = crypto.createHash('sha256').update(structuralParts).digest('hex');

    const strippedMessage = VolatilityStripper.strip(uir.message || '');
    const contextualParts = `${structuralHash}|${uir.errorType}|${strippedMessage}`;
    const contextualHash = crypto.createHash('sha256').update(contextualParts).digest('hex');

    const envTags = `${process.env.SERVICE_NAME || ''}|${process.env.DEPLOYMENT_VERSION || ''}|${process.env.CLUSTER_ID || ''}`;
    const systemParts = `${contextualHash}|${envTags}`;
    const systemHash = crypto.createHash('sha256').update(systemParts).digest('hex');

    return { structural: structuralHash, contextual: contextualHash, systemVariant: systemHash };
  }
}