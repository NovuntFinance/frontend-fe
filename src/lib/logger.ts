/**
 * Centralized Logging Utility
 * Provides structured logging with different log levels
 * Automatically disabled in production (unless explicitly enabled)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private enabled: boolean;
  private prefix: string;

  constructor(prefix = '[App]') {
    this.prefix = prefix;
    // Enable logging in development and test, or when explicitly enabled
    this.enabled =
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test' ||
      process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';
  }

  /**
   * Format log message with emoji and styling
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): unknown[] {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅',
    }[level];

    const parts: unknown[] = [
      `${emoji} ${this.prefix} [${timestamp}]`,
      message,
    ];

    if (context && Object.keys(context).length > 0) {
      parts.push('\n', context);
    }

    return parts;
  }

  /**
   * Debug level - detailed information for debugging
   */
  debug(message: string, context?: LogContext): void {
    if (!this.enabled) return;
    console.log(...this.formatMessage('debug', message, context));
  }

  /**
   * Info level - general informational messages
   */
  info(message: string, context?: LogContext): void {
    if (!this.enabled) return;
    console.info(...this.formatMessage('info', message, context));
  }

  /**
   * Warn level - warning messages
   */
  warn(message: string, context?: LogContext): void {
    if (!this.enabled) return;
    console.warn(...this.formatMessage('warn', message, context));
  }

  /**
   * Error level - error messages (always logged, even in production)
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
    };

    // Always log errors, even in production
    console.error(...this.formatMessage('error', message, errorContext));

    // In production, you might want to send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Error tracking configured via Sentry (see src/lib/error-tracking.ts)
      // Additional tracking can be added here if needed
    }
  }

  /**
   * Success level - success messages
   */
  success(message: string, context?: LogContext): void {
    if (!this.enabled) return;
    console.log(...this.formatMessage('success', message, context));
  }

  /**
   * Group logs together
   */
  group(label: string, collapsed = false): void {
    if (!this.enabled) return;
    if (collapsed) {
      console.groupCollapsed(label);
    } else {
      console.group(label);
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (!this.enabled) return;
    console.groupEnd();
  }

  /**
   * Time measurement
   */
  time(label: string): void {
    if (!this.enabled) return;
    console.time(label);
  }

  /**
   * End time measurement
   */
  timeEnd(label: string): void {
    if (!this.enabled) return;
    console.timeEnd(label);
  }

  /**
   * Create a child logger with a different prefix
   */
  child(prefix: string): Logger {
    return new Logger(`${this.prefix}:${prefix}`);
  }
}

// Export singleton instance
export const logger = new Logger('[Novunt]');

// Export specific domain loggers
export const apiLogger = logger.child('API');
export const authLogger = logger.child('Auth');
export const walletLogger = logger.child('Wallet');
export const stakingLogger = logger.child('Staking');
export const queryLogger = logger.child('Query');
export const uiLogger = logger.child('UI');

// Export Logger class for custom instances
export { Logger };

// Export default
export default logger;
