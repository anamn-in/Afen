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