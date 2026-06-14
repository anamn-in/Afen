import { RawErrorPayload } from '@models/uir/UIREvent';

const stackTemplates: Record<string, string[]> = {
  javascript: ['at test.js:10:5', 'at main.js:20:10'],
  python: ['  File "test.py", line 10, in <module>', '  File "lib.py", line 25, in func'],
  go: ['main.main()\n\t/test.go:10 +0x20', 'runtime.main()\n\t/usr/local/go/src/runtime/proc.go:250'],
};

export function generateMockPayload(language: string, message?: string): RawErrorPayload {
  const defaultMessage = `Unhandled error in ${language}`;
  const errorMessage = message || defaultMessage;
  const errorType = `${language.charAt(0).toUpperCase() + language.slice(1)}Error`;
  const stackTraceRaw = stackTemplates[language] || stackTemplates.javascript;

  return {
    message: errorMessage,
    errorType,
    stackTraceRaw,
    environment: { NODE_ENV: 'test', SERVICE_NAME: `test-${language}` },
    processInfo: { pid: process.pid, cwd: process.cwd() },
    language,
    timestamp: Date.now(),
    attributes: { source: 'mock', testId: `test-${Date.now()}` },
  };
}