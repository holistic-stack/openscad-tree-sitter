/**
 * @file Logger implementation for the OpenSCAD parser error handling system.
 * @module openscad-parser/error-handling/logger
 */

import { Severity } from './types/error-types.ts';

/** Configuration options for the Logger */
export interface LoggerOptions {
  /** Minimum severity level to log */
  level?: Severity;
  /** Whether to include timestamps in log messages */
  includeTimestamp?: boolean;
  /** Whether to include severity level in log messages */
  includeSeverity?: boolean;
  /** Custom output function (defaults to console) */
  output?: (message: string) => void;
  /** Whether to enable logging (can be disabled for testing) */
  enabled?: boolean;
}

/** Severity level numeric values for comparison */
const SEVERITY_LEVELS: Record<Severity, number> = {
  [Severity.DEBUG]: 0,
  [Severity.INFO]: 1,
  [Severity.WARNING]: 2,
  [Severity.ERROR]: 3,
  [Severity.FATAL]: 4,
};

/**
 * Logger class for structured logging with configurable severity levels.
 *
 * @example
 * ```typescript
 * const logger = new Logger({ level: Severity.WARNING });
 * logger.debug('This will not be logged');
 * logger.warn('This will be logged');
 * logger.error('This will be logged');
 * ```
 */
export class Logger {
  private options: Required<LoggerOptions>;

  /**
   * Creates a new Logger instance
   * @param options - Configuration options for the logger
   */
  constructor(options: LoggerOptions = {}) {
    this.options = {
      level: options.level ?? Severity.INFO,
      includeTimestamp: options.includeTimestamp ?? true,
      includeSeverity: options.includeSeverity ?? true,
      output: options.output ?? console.log,
      enabled: options.enabled ?? true,
    };
  }

  /**
   * Sets the minimum log level
   * @param level - The minimum severity level to log
   */
  setLevel(level: Severity): void {
    this.options.level = level;
  }

  /**
   * Gets the current log level
   * @returns The current minimum severity level
   */
  getLevel(): Severity {
    return this.options.level;
  }

  /**
   * Enables or disables logging
   * @param enabled - Whether logging should be enabled
   */
  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
  }

  /**
   * Checks if logging is enabled
   * @returns Whether logging is currently enabled
   */
  isEnabled(): boolean {
    return this.options.enabled;
  }

  /**
   * Logs a message at the specified severity level
   * @param level - The severity level of the message
   * @param message - The message to log
   */
  log(level: Severity, message: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message);
    this.options.output(formattedMessage);
  }

  /**
   * Logs a debug message
   * @param message - The message to log
   */
  debug(message: string): void {
    this.log(Severity.DEBUG, message);
  }

  /**
   * Logs an info message
   * @param message - The message to log
   */
  info(message: string): void {
    this.log(Severity.INFO, message);
  }

  /**
   * Logs a warning message
   * @param message - The message to log
   */
  warn(message: string): void {
    this.log(Severity.WARNING, message);
  }

  /**
   * Logs an error message
   * @param message - The message to log
   */
  error(message: string): void {
    this.log(Severity.ERROR, message);
  }

  /**
   * Logs a fatal error message
   * @param message - The message to log
   */
  fatal(message: string): void {
    this.log(Severity.FATAL, message);
  }

  /**
   * Determines if a message should be logged based on severity level
   * @param level - The severity level to check
   * @returns Whether the message should be logged
   */
  private shouldLog(level: Severity): boolean {
    if (!this.options.enabled) {
      return false;
    }

    return SEVERITY_LEVELS[level] >= SEVERITY_LEVELS[this.options.level];
  }

  /**
   * Formats a log message with timestamp and severity level
   * @param level - The severity level of the message
   * @param message - The message to format
   * @returns The formatted message
   */
  private formatMessage(level: Severity, message: string): string {
    const parts: string[] = [];

    if (this.options.includeTimestamp) {
      const timestamp = new Date().toISOString();
      parts.push(`[${timestamp}]`);
    }

    if (this.options.includeSeverity) {
      parts.push(`[${level}]`);
    }

    parts.push(message);

    return parts.join(' ');
  }
}
