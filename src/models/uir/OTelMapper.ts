import { NormalizedUIREvent } from './UIREvent';

export class OTelMapper {
  static toOTelAttributes(uir: Partial<NormalizedUIREvent>): Record<string, any> {
    const attrs: Record<string, any> = {
      'exception.type': uir.errorType,
      'exception.message': uir.message,
      'exception.stacktrace': uir.normalizedStack?.map(f => f.raw).join('\n'),
      'code.function': uir.normalizedStack?.[0]?.functionName,
      'code.filepath': uir.normalizedStack?.[0]?.filename,
      'code.lineno': uir.normalizedStack?.[0]?.lineNumber,
      'service.name': process.env.SERVICE_NAME || 'afen',
      'telemetry.sdk.name': 'afen',
      'telemetry.sdk.version': '1.0.0',
      'telemetry.sdk.language': 'typescript',
    };
    Object.keys(attrs).forEach(k => attrs[k] === undefined && delete attrs[k]);
    return attrs;
  }
}