// Browser-compatible logger for portal
// For production, consider using a proper logging service like Sentry or LogRocket

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  [key: string]: any;
}

class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(level: LogLevel = LogLevel.INFO, prefix: string = '') {
    this.level = level;
    this.prefix = prefix;
  }

  child(name: string): Logger {
    return new Logger(this.level, this.prefix ? `${this.prefix}:${name}` : name);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = this.prefix ? `[${this.prefix}]` : '';
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `${timestamp} ${level} ${prefix} ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  error(message: string, errorContext?: LogContext): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message, errorContext));
    }
  }
}

// Create default logger instance
export const logger = new Logger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

// Feature-specific loggers
export const agentLogger = logger.child('Agent');
// legacy: n8n removed
export const destinationLogger = logger.child('Destination');
export const executionLogger = logger.child('Execution');
