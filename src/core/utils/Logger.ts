export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  debug(...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) console.debug('[DEBUG]', ...args);
  }
  info(...args: any[]): void {
    if (this.level <= LogLevel.INFO) console.info('[INFO]', ...args);
  }
  warn(...args: any[]): void {
    if (this.level <= LogLevel.WARN) console.warn('[WARN]', ...args);
  }
  error(...args: any[]): void {
    if (this.level <= LogLevel.ERROR) console.error('[ERROR]', ...args);
  }
}

export const logger = new Logger(
  process.env.LOG_LEVEL === 'debug'
    ? LogLevel.DEBUG
    : process.env.LOG_LEVEL === 'warn'
    ? LogLevel.WARN
    : process.env.LOG_LEVEL === 'error'
    ? LogLevel.ERROR
    : LogLevel.INFO
);