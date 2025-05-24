/**
 * @file Implements recovery strategy for unclosed bracket/brace/parenthesis errors.
 * @module openscad-parser/error-handling/strategies/unclosed-bracket-strategy
 */

import { ParserError, ErrorCode, Severity } from '../types/error-types.ts';
import { BaseRecoveryStrategy } from './recovery-strategy.ts';

type BracketType = 'PAREN' | 'BRACKET' | 'BRACE';

interface BracketInfo {
  open: string;
  close: string;
  type: BracketType;
  errorCode: ErrorCode;
}

/**
 * Recovery strategy for handling unclosed bracket/brace/parenthesis errors.
 *
 * This strategy detects and recovers from unclosed brackets, braces, and parentheses
 * by automatically inserting the corresponding closing character.
 */
export class UnclosedBracketStrategy extends BaseRecoveryStrategy {
  private readonly bracketMap: Record<string, BracketInfo> = {
    '(': { open: '(', close: ')', type: 'PAREN', errorCode: ErrorCode.UNCLOSED_PAREN },
    '[': { open: '[', close: ']', type: 'BRACKET', errorCode: ErrorCode.UNCLOSED_BRACKET },
    '{': { open: '{', close: '}', type: 'BRACE', errorCode: ErrorCode.UNCLOSED_BRACE },
  };

  private readonly bracketTypes = Object.values(this.bracketMap);

  /** Higher priority than default */
  public readonly priority: number = 40;

  /**
   * Determines if this strategy can handle the given error
   */
  canHandle(error: ParserError): boolean {
    return (
      error.code === ErrorCode.UNCLOSED_PAREN ||
      error.code === ErrorCode.UNCLOSED_BRACKET ||
      error.code === ErrorCode.UNCLOSED_BRACE ||
      (error.code === ErrorCode.SYNTAX_ERROR &&
       (error.message.includes('missing') &&
        (error.message.includes(')') ||
         error.message.includes(']') ||
         error.message.includes('}'))))
    );
  }

  /**
   * Attempts to recover from an unclosed bracket error
   */
  recover(error: ParserError, code: string): string | null {
    const position = this.getErrorPosition(error);
    if (!position) return null;

    const { line: lineNumber, column } = position;
    const lineContent = this.getLine(code, lineNumber);
    if (!lineContent) return null;

    // Find the last unclosed bracket before the error position
    const bracketInfo = this.findLastUnclosedBracket(lineContent, column - 1);
    if (!bracketInfo) return null;

    // Insert the missing closing bracket
    return this.insertAtPosition(
      code,
      lineNumber,
      column,
      bracketInfo.close
    );
  }

  /**
   * Finds the last unclosed bracket in the given line
   */
  private findLastUnclosedBracket(
    line: string,
    errorPosition: number
  ): BracketInfo | null {
    const stack: BracketInfo[] = [];

    // Scan the line up to the error position
    for (let i = 0; i <= Math.min(errorPosition, line.length - 1); i++) {
      const char = line[i];
      const bracket = this.bracketMap[char];

      if (bracket) {
        // Found an opening bracket
        stack.push(bracket);
      } else {
        // Check for closing brackets
        for (const bracketType of this.bracketTypes) {
          if (char === bracketType.close) {
            // If the top of the stack matches, pop it
            if (stack.length > 0 && stack[stack.length - 1].close === char) {
              stack.pop();
            }
            break;
          }
        }
      }
    }

    // Return the last unclosed bracket, if any
    return stack.length > 0 ? stack[stack.length - 1] : null;
  }

  /**
   * Gets a human-readable description of the recovery action
   */
  getRecoverySuggestion(error: ParserError): string {
    if (error.code === ErrorCode.UNCLOSED_PAREN ||
        (error.code === ErrorCode.SYNTAX_ERROR && error.message.includes(')'))
    ) {
      return 'Insert missing closing parenthesis';
    } else if (error.code === ErrorCode.UNCLOSED_BRACKET ||
               (error.code === ErrorCode.SYNTAX_ERROR && error.message.includes(']'))) {
      return 'Insert missing closing bracket';
    } else if (error.code === ErrorCode.UNCLOSED_BRACE ||
               (error.code === ErrorCode.SYNTAX_ERROR && error.message.includes('}'))) {
      return 'Insert missing closing brace';
    }
    return 'Insert missing closing bracket/brace/parenthesis';
  }
}
