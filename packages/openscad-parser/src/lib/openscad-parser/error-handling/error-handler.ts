/**
 * @file Central error error-handling for the OpenSCAD parser.
 * @module openscad-parser/error-handling/error-handler
 */

import {
  ParserError,
  SyntaxError,
  TypeError,
  ValidationError,
  ReferenceError,
  InternalError,
  Severity,
  ErrorContext,
  ErrorCode
} from './types/error-types.ts';
import { Logger, LoggerOptions } from './logger.ts';
import { RecoveryStrategyRegistry } from './recovery-strategy-registry.ts';

/** Configuration options for the ErrorHandler */
export interface ErrorHandlerOptions {
  /** Whether to throw errors immediately when they occur */
  throwErrors?: boolean;
  /** Minimum severity level for errors to be considered critical */
  minSeverity?: Severity;
  /** Whether to include source code in error context */
  includeSource?: boolean;
  /** Whether to attempt error recovery */
  attemptRecovery?: boolean;
  /** Logger configuration options */
  loggerOptions?: LoggerOptions;
}

/**
 * Central error error-handling for managing errors and recovery in the OpenSCAD parser.
 *
 * The ErrorHandler provides:
 * - Error collection and reporting
 * - Error recovery using registered strategies
 * - Configurable error handling behavior
 * - Integration with logging system
 *
 * @example
 * ```typescript
 * const errorHandler = new ErrorHandler({
 *   throwErrors: false,
 *   minSeverity: Severity.WARNING,
 *   attemptRecovery: true
 * });
 *
 * // Create and report an error
 * const error = errorHandler.createSyntaxError('Missing semicolon', {
 *   line: 10,
 *   column: 5
 * });
 *
 * // Attempt recovery
 * const recoveredCode = errorHandler.attemptRecovery(error, originalCode);
 * ```
 */
export class ErrorHandler {
  private errors: ParserError[] = [];
  private recoveryRegistry: RecoveryStrategyRegistry;
  private logger: Logger;

  /** Configuration options for the error error-handling */
  public readonly options: Required<ErrorHandlerOptions>;

  /**
   * Creates a new ErrorHandler
   * @param options - Configuration options
   */
  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      throwErrors: options.throwErrors ?? true,
      minSeverity: options.minSeverity ?? Severity.ERROR,
      includeSource: options.includeSource ?? true,
      attemptRecovery: options.attemptRecovery ?? false,
      loggerOptions: options.loggerOptions ?? {},
    };

    this.logger = new Logger(this.options.loggerOptions);
    this.recoveryRegistry = new RecoveryStrategyRegistry();
  }

  /**
   * Creates a generic parser error
   * @param message - Error message
   * @param context - Error context
   * @returns New ParserError instance
   */
  createParserError(message: string, context: ErrorContext = {}): ParserError {
    return new ParserError(message, ErrorCode.INTERNAL_ERROR, Severity.ERROR, context);
  }

  /**
   * Creates a syntax error
   * @param message - Error message
   * @param context - Error context
   * @returns New SyntaxError instance
   */
  createSyntaxError(message: string, context: ErrorContext = {}): SyntaxError {
    return new SyntaxError(message, context);
  }

  /**
   * Creates a type error
   * @param message - Error message
   * @param context - Error context
   * @returns New TypeError instance
   */
  createTypeError(message: string, context: ErrorContext = {}): TypeError {
    return new TypeError(message, context);
  }

  /**
   * Creates a validation error
   * @param message - Error message
   * @param context - Error context
   * @returns New ValidationError instance
   */
  createValidationError(message: string, context: ErrorContext = {}): ValidationError {
    return new ValidationError(message, context);
  }

  /**
   * Creates a reference error
   * @param message - Error message
   * @param context - Error context
   * @returns New ReferenceError instance
   */
  createReferenceError(message: string, context: ErrorContext = {}): ReferenceError {
    return new ReferenceError(message, context);
  }

  /**
   * Creates an internal error
   * @param message - Error message
   * @param context - Error context
   * @returns New InternalError instance
   */
  createInternalError(message: string, context: ErrorContext = {}): InternalError {
    return new InternalError(message, context);
  }

  /**
   * Reports an error to the error-handling
   * @param error - The error to report
   */
  report(error: ParserError): void {
    // Only collect errors that meet the minimum severity threshold
    if (this.shouldCollectError(error)) {
      this.errors.push(error);
      this.logger.log(error.severity, error.getFormattedMessage());
    }

    // Throw error if configured to do so and error is critical
    if (this.options.throwErrors && this.isCriticalError(error)) {
      throw error;
    }
  }

  /**
   * Attempts to recover from an error using registered strategies
   * @param error - The error to recover from
   * @param code - The original source code
   * @returns The recovered code if successful, null otherwise
   */
  attemptRecovery(error: ParserError, code: string): string | null {
    if (!this.options.attemptRecovery) {
      return null;
    }

    this.logger.debug(`Attempting recovery for error: ${error.message}`);

    const recoveredCode = this.recoveryRegistry.attemptRecovery(error, code);

    if (recoveredCode) {
      this.logger.info(`Successfully recovered from error: ${error.message}`);
    } else {
      this.logger.debug(`Could not recover from error: ${error.message}`);
    }

    return recoveredCode;
  }

  /**
   * Gets all collected errors
   * @returns Array of collected errors
   */
  getErrors(): readonly ParserError[] {
    return [...this.errors];
  }

  /**
   * Gets errors filtered by severity level
   * @param minSeverity - Minimum severity level to include
   * @returns Array of filtered errors
   */
  getErrorsBySeverity(minSeverity: Severity): ParserError[] {
    const minLevel = this.getSeverityLevel(minSeverity);
    return this.errors.filter(error => this.getSeverityLevel(error.severity) >= minLevel);
  }

  /**
   * Clears all collected errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Checks if there are any errors
   * @returns True if there are collected errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Checks if there are any critical errors
   * @returns True if there are critical errors
   */
  hasCriticalErrors(): boolean {
    return this.errors.some(error => this.isCriticalError(error));
  }

  /**
   * Gets the recovery strategy registry
   * @returns The recovery strategy registry
   */
  getRecoveryRegistry(): RecoveryStrategyRegistry {
    return this.recoveryRegistry;
  }

  /**
   * Gets the logger instance
   * @returns The logger instance
   */
  getLogger(): Logger {
    return this.logger;
  }

  /**
   * Logs an info message
   * @param message - The message to log
   * @param context - Optional context information
   * @param node - Optional tree-sitter node for additional context
   */
  logInfo(message: string, context?: string, node?: any): void {
    this.logger.info(message);
  }

  /**
   * Logs a debug message
   * @param message - The message to log
   * @param context - Optional context information
   * @param node - Optional tree-sitter node for additional context
   */
  logDebug(message: string, context?: string, node?: any): void {
    this.logger.debug(message);
  }

  /**
   * Logs a warning message
   * @param message - The message to log
   * @param context - Optional context information
   * @param node - Optional tree-sitter node for additional context
   */
  logWarning(message: string, context?: string, node?: any): void {
    this.logger.warn(message);
  }

  /**
   * Logs an error message
   * @param message - The message to log
   * @param context - Optional context information
   * @param node - Optional tree-sitter node for additional context
   */
  logError(message: string, context?: string, node?: any): void {
    this.logger.error(message);
  }

  /**
   * Handles an error by logging it and optionally reporting it
   * @param error - The error to handle
   * @param context - Optional context information
   * @param node - Optional tree-sitter node for additional context
   */
  handleError(error: Error, context?: string, node?: any): void {
    const message = context ? `${context}: ${error.message}` : error.message;
    this.logger.error(message);
  }

  /**
   * Determines if an error should be collected based on severity
   * @param error - The error to check
   * @returns True if the error should be collected
   */
  private shouldCollectError(error: ParserError): boolean {
    return this.getSeverityLevel(error.severity) >= this.getSeverityLevel(this.options.minSeverity);
  }

  /**
   * Determines if an error is critical and should cause throwing
   * @param error - The error to check
   * @returns True if the error is critical
   */
  private isCriticalError(error: ParserError): boolean {
    return this.getSeverityLevel(error.severity) >= this.getSeverityLevel(Severity.ERROR);
  }

  /**
   * Gets the numeric level for a severity
   * @param severity - The severity to get level for
   * @returns Numeric level for comparison
   */
  private getSeverityLevel(severity: Severity): number {
    const levels: Record<Severity, number> = {
      [Severity.DEBUG]: 0,
      [Severity.INFO]: 1,
      [Severity.WARNING]: 2,
      [Severity.ERROR]: 3,
      [Severity.FATAL]: 4,
    };
    return levels[severity] ?? 0;
  }
}
