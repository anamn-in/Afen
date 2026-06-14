import { CauseChain, StackFrame } from './UIRSource';
import { RawErrorPayload } from './UIREvent';
import { StackFrameParser } from './StackFrameParser';

export class CauseChainUnwrapper {
  static unwrap(payload: RawErrorPayload): CauseChain {
    const stackFrames = this.parseStackFrames(payload.stackTraceRaw, payload.language);
    const chain: CauseChain = {
      message: payload.message,
      type: payload.errorType,
      stackFrames,
    };
    if (payload.innerError) {
      chain.cause = this.unwrap(payload.innerError);
    }
    return chain;
  }

  private static parseStackFrames(raw: string | string[], language: string): StackFrame[] {
    const lines = Array.isArray(raw) ? raw : raw.split('\n');
    const frames: StackFrame[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const frame = StackFrameParser.parse(trimmed, language);
      if (frame) frames.push(frame);
    }
    return frames;
  }
}