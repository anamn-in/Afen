export interface StackFrame {
  readonly functionName: string;
  readonly variables: Readonly<Record<string, unknown>>;
  readonly line: number;
}

export class RuntimeState {
  constructor(
    public readonly variables: Readonly<Record<string, unknown>> = {},
    public readonly stack: readonly StackFrame[] = [],
    public readonly heapSize: number = 0,
    public readonly timestamp: number = Date.now()
  ) {}

  update(updates: Partial<RuntimeState>): RuntimeState {
    return new RuntimeState(
      updates.variables !== undefined ? { ...this.variables, ...updates.variables } : this.variables,
      updates.stack ?? this.stack,
      updates.heapSize ?? this.heapSize,
      updates.timestamp ?? Date.now()
    );
  }
}