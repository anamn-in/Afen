const STACK_PATTERNS: Record<string, RegExp> = {
  python: /^\s*File\s+".+?",\s+line\s+\d+/m,
  java: /^\s*at\s+[\w.$]+\.[\w$]+\(.+?\.java:\d+\)/m,
  csharp: /^\s*at\s+.+?\(.*?\)\s+in\s+.+?:line\s+\d+/m,
  go: /^\s*[\w./]+\.go:\d+/m,
  rust: /^\s*at\s+.+?\s+\(.+?\.rs:\d+\)/m,
  cpp: /^\s*#\d+\s+.+?\[.+?\.(?:cpp|cc|cxx):\d+\]/m,
  c: /^\s*#\d+\s+.+?\[.+?\.c:\d+\]/m,
  ruby: /^\s*.+?\.rb:\d+(?::in\s+`.+?')?/m,
  typescript: /^\s*at\s+.+?\(.+?\.tsx?:\d+:\d+\)/m,
  javascript: /^\s*at\s+.+?\(.+?\.jsx?:\d+:\d+\)/m,
};

const ERROR_TYPE_HINTS: Array<{ pattern: RegExp; language: string }> = [
  { pattern: /^(TypeError|ReferenceError|RangeError|SyntaxError)$/i, language: 'javascript' },
  { pattern: /^(ValueError|KeyError|IndexError|AttributeError|ZeroDivisionError)$/i, language: 'python' },
  { pattern: /^.*Exception$/i, language: 'java' },
  { pattern: /^System\..*Exception$/i, language: 'csharp' },
  { pattern: /^panic:/i, language: 'go' },
  { pattern: /^thread\s+'.+?'\s+panicked/i, language: 'rust' },
  { pattern: /^Segmentation\s+fault|^SIGSEGV/i, language: 'cpp' },
  { pattern: /^.*Error\s*\(.+?\)$/i, language: 'ruby' },
];

const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'go',
  'rust', 'c', 'cpp', 'csharp', 'ruby', 'sql',
];

export class LanguageDetector {
  /**
   * Attempts to detect the source language of an error using both the
   * raw stack trace content and the error type naming convention.
   * Falls back to 'unknown' if no signal matches.
   */
  static detect(stackTraceRaw: string | string[] | undefined | null, errorType: string | undefined): string {
    const stackLanguage = this.detectFromStack(stackTraceRaw);
    if (stackLanguage) {
      return stackLanguage;
    }

    const errorTypeLanguage = this.detectFromErrorType(errorType);
    if (errorTypeLanguage) {
      return errorTypeLanguage;
    }

    return 'unknown';
  }

  private static detectFromStack(stackTraceRaw: string | string[] | undefined | null): string | null {
    if (!stackTraceRaw) {
      return null;
    }

    const text = Array.isArray(stackTraceRaw) ? stackTraceRaw.join('\n') : stackTraceRaw;
    if (!text.trim()) {
      return null;
    }

    // TypeScript and JavaScript share a near-identical stack format, so check
    // for a .ts/.tsx extension first to avoid TS frames being misclassified.
    const orderedLanguages = ['typescript', 'javascript', ...Object.keys(STACK_PATTERNS).filter(
      l => l !== 'typescript' && l !== 'javascript'
    )];

    for (const language of orderedLanguages) {
      const pattern = STACK_PATTERNS[language];
      if (pattern && pattern.test(text)) {
        return language;
      }
    }

    return null;
  }

  private static detectFromErrorType(errorType: string | undefined): string | null {
    if (!errorType) {
      return null;
    }

    for (const hint of ERROR_TYPE_HINTS) {
      if (hint.pattern.test(errorType.trim())) {
        return hint.language;
      }
    }

    return null;
  }

  static isSupported(language: string): boolean {
    return SUPPORTED_LANGUAGES.includes(language);
  }
}