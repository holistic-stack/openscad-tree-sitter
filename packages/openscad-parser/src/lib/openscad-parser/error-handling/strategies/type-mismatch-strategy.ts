/**
 * @file Implements recovery strategy for type mismatch errors.
 * @module openscad-parser/error-handling/strategies/type-mismatch-strategy
 */

import { ParserError, ErrorCode, Severity, type ErrorContext } from '../types/error-types.ts';
import { BaseRecoveryStrategy } from './recovery-strategy.ts';

/**
 * Interface for type checking functionality
 */
interface TypeChecker {
  /**
   * Gets the type of a value or expression
   */
  getType(value: unknown): string;

  /**
   * Checks if a type is assignable to another type
   */
  isAssignable(fromType: string, toType: string): boolean;

  /**
   * Finds a common type that all given types can be converted to
   */
  findCommonType(types: string[]): string | null;
}

/**
 * Recovery strategy for handling type mismatch errors.
 *
 * This strategy attempts to recover from type-related errors by:
 * 1. Converting values to the expected type when possible
 * 2. Adding explicit type conversions for binary operations
 * 3. Suggesting fixes for function argument type mismatches
 */
export class TypeMismatchStrategy extends BaseRecoveryStrategy {
  private readonly typeConverters: Record<string, Record<string, (value: string) => string>> = {
    'string': {
      'number': (v) => {
        // If it's a quoted string containing only a number, just remove quotes
        if (v.startsWith('"') && v.endsWith('"')) {
          const inner = v.slice(1, -1);
          if (/^-?\d+(\.\d+)?$/.test(inner)) {
            return inner;
          }
        }
        return `parseFloat(${v})`;
      },
      'boolean': (v) => `(${v} != "" && ${v}.toLowerCase() !== "false")`,
    },
    'number': {
      'string': (v) => `str(${v})`,
      'boolean': (v) => `(${v} != 0)`,
    },
    'boolean': {
      'string': (v) => `(${v} ? "true" : "false")`,
      'number': (v) => `(${v} ? 1 : 0)`,
    },
  };

  constructor(private readonly typeChecker: TypeChecker) {
    super();
  }

  /** Higher priority than default */
  public readonly priority: number = 20;

  /**
   * Determines if this strategy can handle the given error
   */
  canHandle(error: ParserError): boolean {
    return [
      ErrorCode.TYPE_MISMATCH,
      ErrorCode.INVALID_OPERATION,
      ErrorCode.INVALID_ARGUMENTS,
    ].includes(error.code);
  }

  /**
   * Attempts to recover from a type mismatch error
   */
  recover(error: ParserError, code: string): string | null {
    try {
      if (error.code === ErrorCode.TYPE_MISMATCH) {
        return this.handleTypeMismatch(error, code);
      } else if (error.code === ErrorCode.INVALID_OPERATION) {
        // Complex binary operation recovery is not yet implemented
        return null;
      } else if (error.code === ErrorCode.INVALID_ARGUMENTS) {
        // Complex function argument recovery is not yet implemented
        return null;
      }
    } catch (_e) {
      // If any error occurs during recovery, log it and return null
      console.warn('Error during type mismatch recovery:', _e);
    }
    return null;
  }

  /**
   * Handles simple type mismatch errors
   */
  private handleTypeMismatch(error: ParserError, code: string): string | null {
    const { expected, found, value, location } = error.context;
    if (!expected || !found || !location) return null;

    // Check if we can convert from found type to expected type
    const expectedType = Array.isArray(expected) ? expected[0] : expected;
    if (this.canConvert(found, expectedType)) {
      const convertedValue = this.convertValue(value || '', found, expectedType);
      if (convertedValue !== null) {
        return this.replaceAtPosition(
          code,
          location.line,
          location.column,
          value || '',
          convertedValue
        );
      }
    }

    return null;
  }

  /**
   * Handles invalid operation errors (e.g., number + string)
   */
  private handleInvalidOperation(error: ParserError, code: string): string | null {
    const {
      operation,
      leftType,
      rightType,
      leftValue,
      rightValue,
      location
    } = error.context;

    if (!operation || !leftType || !rightType || !location) return null;

    // Find a common type that both operands can be converted to
    const commonType = this.typeChecker.findCommonType([leftType, rightType]);
    if (!commonType) return null;

    // Convert both operands to the common type
    const convertLeft = this.canConvert(leftType, commonType) && leftValue;
    const convertRight = this.canConvert(rightType, commonType) && rightValue;

    if (convertLeft || convertRight) {
      const left = convertLeft
        ? this.convertValue(leftValue, leftType, commonType)
        : leftValue;
      const right = convertRight
        ? this.convertValue(rightValue, rightType, commonType)
        : rightValue;

      if (left !== null && right !== null) {
        // Reconstruct the operation with type conversions
        const original = `${leftValue} ${operation} ${rightValue}`;
        const converted = `${left} ${operation} ${right}`;

        return this.replaceAtPosition(
          code,
          location.line,
          location.column,
          original,
          converted
        );
      }
    }

    return null;
  }

  /**
   * Handles function argument type mismatches
   */
  private handleInvalidArguments(error: ParserError, code: string): string | null {
    const {
      functionName,
      paramIndex,
      expected,
      found,
      value,
      location
    } = error.context;

    if (expected === undefined || found === undefined || !location || value === undefined) {
      return null;
    }

    // Check if we can convert the argument to the expected type
    const expectedType = Array.isArray(expected) ? expected[0] : expected;
    if (this.canConvert(found, expectedType)) {
      const convertedValue = this.convertValue(value, found, expectedType);
      if (convertedValue !== null) {
        return this.replaceAtPosition(
          code,
          location.line,
          location.column,
          value,
          convertedValue
        );
      }
    }

    return null;
  }

  /**
   * Checks if a value of type 'from' can be converted to type 'to'
   */
  private canConvert(from: string, to: string): boolean {
    // Check if types are the same or if an explicit converter exists
    return from === to ||
           this.typeChecker.isAssignable(from, to) ||
           Boolean(this.getConverter(from, to));
  }

  /**
   * Gets a converter function for converting between two types
   */
  private getConverter(from: string, to: string): ((value: string) => string) | null {
    return this.typeConverters[from]?.[to] ?? null;
  }

  /**
   * Converts a value from one type to another
   */
  private convertValue(value: string, from: string, to: string): string | null {
    if (from === to) return value;

    // First try the type checker's conversion
    if (this.typeChecker.isAssignable(from, to)) {
      return value; // No conversion needed if types are compatible
    }

    // Then try explicit converters
    const converter = this.getConverter(from, to);
    if (converter) {
      return converter(value);
    }

    return null;
  }

  /**
   * Gets a human-readable description of the recovery action
   */
  getRecoverySuggestion(error: ParserError): string {
    if (error.code === ErrorCode.TYPE_MISMATCH) {
      const { expected, found } = error.context;
      const expectedType = Array.isArray(expected) ? expected[0] : expected;
      return `Convert ${found} to ${expectedType}`;
    }

    if (error.code === ErrorCode.INVALID_OPERATION) {
      const { operation, leftType, rightType } = error.context;
      return `Convert operands to compatible types for ${operation} operation (${leftType} ${operation} ${rightType})`;
    }

    if (error.code === ErrorCode.INVALID_ARGUMENTS) {
      const { functionName, paramIndex, expected, found } = error.context;
      const expectedType = Array.isArray(expected) ? expected[0] : expected;
      return `Convert argument ${(paramIndex ?? 0) + 1} of ${functionName}() from ${found} to ${expectedType}`;
    }

    return 'Fix type mismatch';
  }

  /**
   * Replace text at a specific position in the code
   * @param code The source code
   * @param line The line number (1-based)
   * @param column The column number (1-based)
   * @param oldText The text to replace
   * @param newText The replacement text
   * @returns The modified code
   */
  private replaceAtPosition(
    code: string,
    line: number,
    column: number,
    oldText: string,
    newText: string
  ): string {
    const lines = code.split('\n');
    if (line < 1 || line > lines.length) {
      return code; // Invalid line number
    }

    const targetLine = lines[line - 1];
    if (column < 1 || column > targetLine.length + 1) {
      return code; // Invalid column number
    }

    // Find the old text starting at the specified position
    const startIndex = column - 1;
    const endIndex = startIndex + oldText.length;

    if (targetLine.substring(startIndex, endIndex) === oldText) {
      // Replace the text
      const newLine = targetLine.substring(0, startIndex) + newText + targetLine.substring(endIndex);
      lines[line - 1] = newLine;
      return lines.join('\n');
    }

    return code; // Text not found at the specified position
  }
}
