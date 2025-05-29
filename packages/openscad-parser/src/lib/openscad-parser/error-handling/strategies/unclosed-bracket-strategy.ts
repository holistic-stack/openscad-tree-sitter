/**
 * @file Implements recovery strategy for unclosed bracket/brace/parenthesis errors.
 * @module openscad-parser/error-handling/strategies/unclosed-bracket-strategy
 */

import { ParserError, ErrorCode } from '../types/error-types.js';
import { BaseRecoveryStrategy } from './recovery-strategy.js';

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
  public override readonly priority: number = 40;

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
    // Find all unclosed brackets in the code
    const unclosedBrackets = this.findAllUnclosedBrackets(code);
    if (unclosedBrackets.length === 0) return null;

    // For braces, add on a new line
    if (unclosedBrackets.some(bracket => bracket.close === '}')) {
      // If there are braces, handle them specially
      const nonBraces = unclosedBrackets.filter(bracket => bracket.close !== '}');
      const braces = unclosedBrackets.filter(bracket => bracket.close === '}');

      let result = code;
      // Add non-brace brackets at the end in reverse order
      for (let i = nonBraces.length - 1; i >= 0; i--) {
        const bracket = nonBraces[i];
        if (bracket) {
          result += bracket.close;
        }
      }
      // Add braces on new lines
      for (const _bracket of braces) {
        result += '\n}';
      }
      return result;
    }

    // For brackets and parentheses, append all missing brackets at the end
    // Close brackets in reverse order (LIFO - Last In, First Out)
    let result = code;
    for (let i = unclosedBrackets.length - 1; i >= 0; i--) {
      const bracket = unclosedBrackets[i];
      if (bracket) {
        result += bracket.close;
      }
    }
    return result;
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
      if (char === undefined) continue;
      const bracket = this.bracketMap[char];

      if (bracket) {
        // Found an opening bracket
        stack.push(bracket);
      } else {
        // Check for closing brackets
        for (const bracketType of this.bracketTypes) {
          if (char === bracketType.close) {
            // If the top of the stack matches, pop it
            const topBracket = stack[stack.length - 1];
            if (stack.length > 0 && topBracket && topBracket.close === char) {
              stack.pop();
            }
            break;
          }
        }
      }
    }

    // Return the last unclosed bracket, if any
    const lastBracket = stack[stack.length - 1];
    return lastBracket ?? null;
  }

  /**
   * Finds the last unclosed bracket in the entire code
   */
  private findLastUnclosedBracketInCode(code: string): BracketInfo | null {
    const stack: BracketInfo[] = [];

    // Scan the entire code
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      if (char === undefined) continue;
      const bracket = this.bracketMap[char];

      if (bracket) {
        // Found an opening bracket
        stack.push(bracket);
      } else {
        // Check for closing brackets
        for (const bracketType of this.bracketTypes) {
          if (char === bracketType.close) {
            // If the top of the stack matches, pop it
            const topBracket = stack[stack.length - 1];
            if (stack.length > 0 && topBracket && topBracket.close === char) {
              stack.pop();
            }
            break;
          }
        }
      }
    }

    // Return the last unclosed bracket, if any
    const lastBracket = stack[stack.length - 1];
    return lastBracket ?? null;
  }

  /**
   * Finds all unclosed brackets in the entire code
   */
  private findAllUnclosedBrackets(code: string): BracketInfo[] {
    const stack: BracketInfo[] = [];

    // Scan the entire code
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      if (char === undefined) continue;
      const bracket = this.bracketMap[char];

      if (bracket) {
        // Found an opening bracket
        stack.push(bracket);
      } else {
        // Check for closing brackets
        for (const bracketType of this.bracketTypes) {
          if (char === bracketType.close) {
            // If the top of the stack matches, pop it
            const topBracket = stack[stack.length - 1];
            if (stack.length > 0 && topBracket && topBracket.close === char) {
              stack.pop();
            }
            break;
          }
        }
      }
    }

    // Return all unclosed brackets
    return stack;
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
