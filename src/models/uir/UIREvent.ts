import { UIRContext } from './UIRContext';

export interface StackFrame {
  raw: string;
  filename: string;
  absolutePath?: string;
  functionName: string;
  lineNumber: number;
  columnNumber?: number;
  language: string;
  metadata?: Record<string, any>;
}

export interface CauseChain {
  message: string;
  type: string;
  stackFrames: StackFrame[];
  cause?: CauseChain;
}

export interface RawErrorPayload {
  message: string;
  errorType: string;
  stackTraceRaw: string | string[];
  innerError?: RawErrorPayload;
  environment: Record<string, string>;
  processInfo: { pid: number; ppid?: number; cwd?: string; argv?: string[]; version?: string };
  attributes?: Record<string, any>;
  language: string;
  timestamp: number;
}

export interface NormalizedUIREvent {
  id: string;
  fingerprint: {
    structural: string;
    contextual: string;
    systemVariant: string;
  };
  message: string;
  errorType: string;
  causeChain: CauseChain;
  environmentSnapshot: Record<string, string>;
  processState: Record<string, any>;
  otelAttributes: Record<string, any>;
  ingestedAt: number;
  sourceLanguage: string;
  normalizedStack: StackFrame[];
  context?: UIRContext;
}