/**
 * @file Implements recovery strategy for missing semicolon errors.
 * @module openscad-parser/error-handling/strategies/missing-semicolon-strategy
 */

import { ParserError, ErrorCode } from '../types/error-types.ts';
import { BaseRecoveryStrategy } from './recovery-strategy.ts';

/**
 * Recovery strategy for handling missing semicolon errors.
 *
 * This strategy detects statements that are missing a terminating semicolon
 * and automatically inserts one at the end of the line.
 */
export class MissingSemicolonStrategy extends BaseRecoveryStrategy {
  /** Higher priority than default */
  public readonly priority: number = 50;

  /**
   * Determines if this strategy can handle the given error
   * @param error - The error to check
   * @returns true if this is a missing semicolon error
   */
  canHandle(error: ParserError): boolean {
    return (
      error.code === ErrorCode.MISSING_SEMICOLON ||
      (error.code === ErrorCode.SYNTAX_ERROR &&
       error.message.toLowerCase().includes('missing semicolon'))
    );
  }

  /**
   * Attempts to recover from a missing semicolon error
   * @param error - The error to recover from
   * @param code - The source code where the error occurred
   * @returns The modified source code with semicolon added, or null if recovery fails
   */
  recover(error: ParserError, code: string): string | null {
    const position = this.getErrorPosition(error);
    if (!position) return null;

    const { line: lineNumber } = position;
    const lineContent = this.getLine(code, lineNumber);
    if (!lineContent) return null;

    // Skip if the line already ends with a semicolon
    if (lineContent.trimEnd().endsWith(';')) {
      return null;
    }

    // Skip if the line is a comment (starts with // after trimming whitespace)
    const trimmed = lineContent.trimStart();
    if (trimmed.startsWith('//')) {
      return null;
    }

    // Add semicolon at the end of the line
    const trimmedEnd = lineContent.trimEnd();
    const modifiedLine = trimmedEnd + ';';

    return this.replaceLine(code, lineNumber, modifiedLine);
  }

  /**
   * Gets a human-readable description of the recovery action
   * @param error - The error being recovered from
   * @returns A description of the recovery action
   */
  getRecoverySuggestion(_error: ParserError): string {
    return 'Insert missing semicolon';
  }
}
