import { StackFrame } from './UIRSource';

export class StackFrameParser {
  private static readonly PATTERNS: Record<string, RegExp> = {
    javascript: /^\s*at\s+(?:(?<func>.+?)\s+\()?(?<file>.+?):(?<line>\d+):(?<col>\d+)\)?/,
    python: /^\s*File\s+"(?<file>.+?)",\s+line\s+(?<line>\d+)(?:,\s+in\s+(?<func>.+?))?/,
    java: /^\s*at\s+(?<func>.+?)\((?<file>.+?):(?<line>\d+)\)/,
    go: /^\s*(?:(?<func>.+?)\s+)?(?<file>.+?):(?<line>\d+)(?:\s+\+0x[0-9a-f]+)?/,
    rust: /^\s*(?:at\s+)?(?<func>.+?)\s+\((?<file>.+?):(?<line>\d+)\)/,
    cpp: /^\s*#\d+\s+(?:(?<func>.+?)\s+)?\[(?<file>.+?):(?<line>\d+)\]/,
    csharp: /^\s*at\s+(?<func>.+?)\(.*?\)\s+in\s+(?<file>.+?):line\s+(?<line>\d+)/,
    ruby: /^\s*(?:(?<func>.+?):\s+)?(?<file>.+?):(?<line>\d+)(?::in\s+`(?<func2>.+?)')?/,
    sql: /^.*$/,
  };

  static parse(rawFrame: string, language: string): StackFrame | null {
    const pattern = this.PATTERNS[language] || this.PATTERNS.javascript;
    const match = rawFrame.match(pattern);
    if (!match) {
      return {
        raw: rawFrame,
        filename: 'unknown',
        functionName: 'unknown',
        lineNumber: 0,
        language,
      };
    }
    const groups = match.groups || {};
    return {
      raw: rawFrame,
      filename: groups.file || 'unknown',
      absolutePath: groups.file,
      functionName: groups.func || groups.func2 || 'anonymous',
      lineNumber: parseInt(groups.line, 10) || 0,
      columnNumber: groups.col ? parseInt(groups.col, 10) : undefined,
      language,
    };
  }
}