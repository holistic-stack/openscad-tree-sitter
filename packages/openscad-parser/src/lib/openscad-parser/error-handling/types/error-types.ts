/**
 * @file Defines the core error types and interfaces for the OpenSCAD parser.
 * @module openscad-parser/error-handling/types/error-types
 */

/** Severity levels for error reporting */
export enum Severity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

/** Error codes for different types of errors */
export enum ErrorCode {
  // Syntax errors (100-199)
  SYNTAX_ERROR = 'E100',
  UNEXPECTED_TOKEN = 'E101',
  MISSING_SEMICOLON = 'E102',
  UNCLOSED_BRACKET = 'E103',
  UNCLOSED_BRACE = 'E104',
  UNCLOSED_PAREN = 'E105',
  UNEXPECTED_EOF = 'E106',

  // Type errors (200-299)
  TYPE_ERROR = 'E200',
  TYPE_MISMATCH = 'E201',
  INVALID_OPERATION = 'E202',
  INVALID_TYPE = 'E203',

  // Reference errors (300-399)
  REFERENCE_ERROR = 'E300',
  UNDEFINED_VARIABLE = 'E301',
  UNDEFINED_FUNCTION = 'E302',
  UNDEFINED_MODULE = 'E303',

  // Validation errors (400-499)
  VALIDATION_ERROR = 'E400',
  INVALID_ARGUMENTS = 'E401',
  INVALID_MODIFIER = 'E402',

  // Internal errors (900-999)
  INTERNAL_ERROR = 'E900',
  NOT_IMPLEMENTED = 'E901',
}

/** Context information about where an error occurred */
export interface ErrorContext {
  /** 1-based line number where the error occurred */
  line?: number;
  /** 1-based column number where the error occurred */
  column?: number;
  /** Length of the error in characters */
  length?: number;
  /** Source code snippet around the error */
  source?: string;
  /** Type of the node where error occurred */
  nodeType?: string;
  /** Expected token/node types */
  expected?: string[];
  /** What was actually found */
  found?: string;
  /** Suggested fix */
  suggestion?: string;
  /** Link to documentation */
  helpUrl?: string;

  // Additional properties for type mismatch errors
  /** The value that caused the error */
  value?: any;
  /** Location information for the error */
  location?: { line: number; column: number };
  /** Operation that caused the error (for binary operations) */
  operation?: string;
  /** Type of the left operand (for binary operations) */
  leftType?: string;
  /** Type of the right operand (for binary operations) */
  rightType?: string;
  /** Value of the left operand (for binary operations) */
  leftValue?: any;
  /** Value of the right operand (for binary operations) */
  rightValue?: any;
  /** Function name (for function call errors) */
  functionName?: string;
  /** Parameter index (for function call errors) */
  paramIndex?: number;
  /** List of suggestions for unknown identifiers */
  suggestions?: string[];
}

/** Base class for all parser errors */
export class ParserError extends Error {
  /**
   * Creates a new ParserError
   * @param message - Human-readable error message
   * @param code - Error code for programmatic handling
   * @param severity - Severity level of the error
   * @param context - Additional context about the error
   */
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly severity: Severity = Severity.ERROR,
    public readonly context: ErrorContext = {}
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintains proper stack trace for where the error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Gets a formatted string representation of the error
   * @returns Formatted error message with context
   */
  getFormattedMessage(): string {
    const { line, column } = this.context;
    const location = line !== undefined && column !== undefined
      ? `[${line}:${column}]`
      : '';

    return `${this.severity} ${location} [${this.code}]: ${this.message}`;
  }

  /**
   * Creates a JSON-serializable representation of the error
   * @returns Plain object with error details
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      stack: this.stack,
    };
  }
}

// Specific error types
export class SyntaxError extends ParserError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.SYNTAX_ERROR, Severity.ERROR, context);
  }
}

export class TypeError extends ParserError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.TYPE_ERROR, Severity.ERROR, context);
  }
}

export class ValidationError extends ParserError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.VALIDATION_ERROR, Severity.ERROR, context);
  }
}

export class ReferenceError extends ParserError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.REFERENCE_ERROR, Severity.ERROR, context);
  }
}

export class InternalError extends ParserError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.INTERNAL_ERROR, Severity.FATAL, {
      ...context,
      helpUrl: 'https://github.com/your-org/openscad-tree-sitter/issues',
    });
  }
}

/** Type guard to check if an error is a ParserError */
export function isParserError(error: unknown): error is ParserError {
  return error instanceof Error &&
         'code' in error &&
         'severity' in error &&
         'context' in error;
}

/** Type guard to check if an error is recoverable */
export function isRecoverable(error: ParserError): boolean {
  return error.severity < Severity.ERROR;
}

/** Type guard to check if an error is fatal */
export function isFatal(error: ParserError): boolean {
  return error.severity === Severity.FATAL;
}
