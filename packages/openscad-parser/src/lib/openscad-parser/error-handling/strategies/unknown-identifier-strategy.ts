/**
 * @file Implements recovery strategy for unknown identifier errors.
 * @module openscad-parser/error-handling/strategies/unknown-identifier-strategy
 */

import { ParserError, ErrorCode, Severity, type ErrorContext } from '../types/error-types.ts';
import { BaseRecoveryStrategy } from './recovery-strategy.ts';

interface IdentifierSuggestion {
  name: string;
  distance: number;
  type?: 'variable' | 'function' | 'module';
}

/**
 * Recovery strategy for handling unknown identifier errors.
 *
 * This strategy suggests corrections for unknown variables and functions
 * by finding similar names in the current scope.
 */
export class UnknownIdentifierStrategy extends BaseRecoveryStrategy {
  private readonly maxSuggestions = 3;
  private readonly maxEditDistance = 2;

  /** Scope-aware identifier tracking */
  private scopedIdentifiers: Map<string, Set<string>> = new Map();
  private currentScope: string[] = [];

  /** Higher priority than default */
  public readonly priority: number = 30;

  /**
   * Updates the current scope for identifier resolution
   * @param scope - Array of scope names (innermost last)
   */
  setCurrentScope(scope: string[]): void {
    this.currentScope = [...scope];
  }

  /**
   * Adds an identifier to the current scope
   * @param name - Identifier name
   * @param type - Type of identifier (variable/function/module)
   */
  addIdentifier(name: string, type: 'variable' | 'function' | 'module' = 'variable'): void {
    const scopeKey = this.currentScope.join('::');
    if (!this.scopedIdentifiers.has(scopeKey)) {
      this.scopedIdentifiers.set(scopeKey, new Set());
    }
    this.scopedIdentifiers.get(scopeKey)?.add(`${type}:${name}`);
  }

  /**
   * Determines if this strategy can handle the given error
   */
  canHandle(error: ParserError): boolean {
    return (
      error.code === ErrorCode.UNDEFINED_VARIABLE ||
      error.code === ErrorCode.UNDEFINED_FUNCTION ||
      error.code === ErrorCode.UNDEFINED_MODULE ||
      (error.code === ErrorCode.REFERENCE_ERROR &&
       (error.message.includes('is not defined') ||
        error.message.includes('undefined variable') ||
        error.message.includes('undefined function') ||
        error.message.includes('undefined module')))
    );
  }

  /**
   * Attempts to recover from an unknown identifier error
   */
  recover(error: ParserError, code: string): string | null {
    const position = this.getErrorPosition(error);
    if (!position) return null;

    const { line: lineNumber, column } = position;
    const lineContent = this.getLine(code, lineNumber);
    if (!lineContent) return null;

    // Extract the unknown identifier from the error message or context
    const identifier = this.extractIdentifier(error);
    if (!identifier) return null;

    // Find similar identifiers in the current scope
    const suggestions = this.findSimilarIdentifiers(identifier);
    if (suggestions.length === 0) return null;

    // Update error context with suggestions
    (error.context.suggestions = suggestions.map(s => s.name));

    // Return the most likely correction
    return this.replaceIdentifier(code, lineNumber, column, identifier, suggestions[0].name);
  }

  /**
   * Extracts the unknown identifier from the error
   */
  private extractIdentifier(error: ParserError): string | null {
    // Try to get from context first
    if (error.context.found) {
      return error.context.found;
    }

    // Extract from common error message patterns
    const message = error.message.toLowerCase();
    const patterns = [
      /undefined (?:variable|function|module) ['"]([^'"]+)['"]/,
      /['"]([^'"]+)['"] is not defined/,
      /unknown identifier ['"]([^'"]+)['"]/,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Finds identifiers similar to the given name in the current scope
   */
  private findSimilarIdentifiers(name: string): IdentifierSuggestion[] {
    const suggestions: IdentifierSuggestion[] = [];
    const scopeKey = this.currentScope.join('::');

    // Check current scope and global scope
    const scopesToCheck = [scopeKey, ''];

    for (const scope of scopesToCheck) {
      const identifiers = this.scopedIdentifiers.get(scope) || [];

      for (const id of identifiers) {
        const [type, idName] = id.split(':', 2);
        const distance = this.calculateLevenshteinDistance(name, idName);

        if (distance <= this.maxEditDistance) {
          suggestions.push({
            name: idName,
            distance,
            type: type as any
          });
        }
      }
    }

    // Sort by edit distance, then by type (variables first), then alphabetically
    return suggestions
      .sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        if (a.type === 'variable' && b.type !== 'variable') return -1;
        if (a.type !== 'variable' && b.type === 'variable') return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, this.maxSuggestions);
  }

  /**
   * Calculates Levenshtein distance between two strings
   */
  private calculateLevenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];

    // Initialize first row and column
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // Deletion
          matrix[i][j - 1] + 1,     // Insertion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }


    return matrix[b.length][a.length];
  }

  /**
   * Replaces an identifier in the source code
   */
  private replaceIdentifier(
    code: string,
    lineNumber: number,
    column: number,
    oldName: string,
    newName: string
  ): string | null {
    const lineContent = this.getLine(code, lineNumber);
    if (!lineContent) return null;

    // Find the exact position of the identifier in the line
    const lineStart = this.getLineStartPosition(code, lineNumber);
    const lineEnd = lineStart + lineContent.length;
    const position = lineStart + (column - 1);

    // Get the surrounding text to ensure we're matching the full identifier
    const before = code.substring(0, position);
    const after = code.substring(position + oldName.length);

    // Only replace if the identifier matches exactly at this position
    if (code.substring(position, position + oldName.length) === oldName) {
      return before + newName + after;
    }

    return null;
  }

  /**
   * Gets the character position of the start of a line
   */
  private getLineStartPosition(code: string, lineNumber: number): number {
    const lines = code.split('\n');
    if (lineNumber < 1 || lineNumber > lines.length) return -1;

    let position = 0;
    for (let i = 0; i < lineNumber - 1; i++) {
      position += lines[i].length + 1; // +1 for newline
    }
    return position;
  }

  /**
   * Gets a human-readable description of the recovery action
   */
  getRecoverySuggestion(error: ParserError): string {
    const suggestions = error.context.suggestions as string[] | undefined;
    if (!suggestions || suggestions.length === 0) {
      return 'Check for typos or missing variable/function declarations';
    }

    return `Did you mean ${suggestions.map(s => `'${s}'`).join(' or ')}?`;
  }
}
