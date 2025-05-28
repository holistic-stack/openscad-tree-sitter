/**
 * @file Defines the base interface and common recovery strategies for error handling.
 * @module openscad-parser/error-handling/strategies/recovery-strategy
 */

import { ParserError } from '../types/error-types.js';

/**
 * Interface that all recovery strategies must implement
 */
export interface RecoveryStrategy {
  /**
   * Determines if this strategy can handle the given error
   * @param error - The error to check
   * @returns true if this strategy can handle the error
   */
  canHandle(error: ParserError): boolean;

  /**
   * Attempts to recover from the error by modifying the source code
   * @param error - The error to recover from
   * @param code - The source code where the error occurred
   * @returns The modified source code, or null if recovery is not possible
   */
  recover(error: ParserError, code: string): string | null;

  /**
   * Gets a human-readable description of the recovery action
   * @param error - The error being recovered from
   * @returns A description of the recovery action
   */
  getRecoverySuggestion(error: ParserError): string;
}

/**
 * Base class for recovery strategies that provides common functionality
 */
export abstract class BaseRecoveryStrategy implements RecoveryStrategy {
  /**
   * The priority of this strategy (lower numbers run first)
   */
  public readonly priority: number = 100;

  /**
   * Determines if this strategy can handle the given error
   * @param error - The error to check
   * @returns true if this strategy can handle the error
   */
  abstract canHandle(error: ParserError): boolean;

  /**
   * Attempts to recover from the error by modifying the source code
   * @param error - The error to recover from
   * @param code - The source code where the error occurred
   * @returns The modified source code, or null if recovery is not possible
   */
  abstract recover(error: ParserError, code: string): string | null;

  /**
   * Gets a human-readable description of the recovery action
   * @param error - The error being recovered from
   * @returns A description of the recovery action
   */
  abstract getRecoverySuggestion(error: ParserError): string;

  /**
   * Gets the line and column from an error's context
   * @param error - The error to get position from
   * @returns An object with line and column (1-based), or null if not available
   */
  protected getErrorPosition(error: ParserError): { line: number; column: number } | null {
    const { line, column } = error.context;
    return line !== undefined && column !== undefined
      ? { line, column }
      : null;
  }

  /**
   * Gets a specific line from the source code
   * @param code - The source code
   * @param lineNumber - The 1-based line number to get
   * @returns The line content, or null if out of bounds
   */
  protected getLine(code: string, lineNumber: number): string | null {
    const lines = code.split('\n');
    return lineNumber > 0 && lineNumber <= lines.length
      ? lines[lineNumber - 1]
      : null;
  }

  /**
   * Replaces a line in the source code
   * @param code - The source code
   * @param lineNumber - The 1-based line number to replace
   * @param newLine - The new line content
   * @returns The modified source code
   */
  protected replaceLine(code: string, lineNumber: number, newLine: string): string {
    const lines = code.split('\n');
    if (lineNumber > 0 && lineNumber <= lines.length) {
      lines[lineNumber - 1] = newLine;
    }
    return lines.join('\n');
  }

  /**
   * Inserts text at a specific position in the source code
   * @param code - The source code
   * @param line - The 1-based line number
   * @param column - The 1-based column number
   * @param text - The text to insert
   * @returns The modified source code
   */
  protected insertAtPosition(code: string, line: number, column: number, text: string): string {
    const lines = code.split('\n');
    if (line < 1 || line > lines.length) return code;

    const lineContent = lines[line - 1];
    const before = lineContent.slice(0, column - 1);
    const after = lineContent.slice(column - 1);

    lines[line - 1] = before + text + after;
    return lines.join('\n');
  }
}
