export type RuntimeEventType = 
  | 'function_call'
  | 'variable_assignment'
  | 'exception_thrown'
  | 'memory_allocation'
  | 'io_operation'
  | 'timer_event';

export interface RuntimeEventPayload {
  readonly functionName?: string;
  readonly variableName?: string;
  readonly value?: unknown;
  readonly exception?: string;
  readonly bytes?: number;
  readonly path?: string;
  readonly durationMs?: number;
}

export class RuntimeEvent {
  constructor(
    public readonly timestamp: number,
    public readonly type: RuntimeEventType,
    public readonly payload: RuntimeEventPayload,
    public readonly sourceLocation?: { file: string; line: number; column: number }
  ) {}

  toString(): string {
    return `[${new Date(this.timestamp).toISOString()}] ${this.type}: ${JSON.stringify(this.payload)}`;
  }
}