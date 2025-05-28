/**
 * @file Recovery strategy registry for managing error recovery strategies.
 * @module openscad-parser/error-handling/recovery-strategy-registry
 */

import { ParserError } from './types/error-types.js';
import { RecoveryStrategy } from './strategies/recovery-strategy.js';
import { MissingSemicolonStrategy } from './strategies/missing-semicolon-strategy.js';
import { UnclosedBracketStrategy } from './strategies/unclosed-bracket-strategy.js';
import { UnknownIdentifierStrategy } from './strategies/unknown-identifier-strategy.js';
// Note: TypeMismatchStrategy requires TypeChecker dependency, not included by default

/**
 * Registry for managing and applying error recovery strategies.
 *
 * The registry follows a chain of responsibility pattern where strategies
 * are tried in order until one can handle the error.
 *
 * @example
 * ```typescript
 * const registry = new RecoveryStrategyRegistry();
 *
 * // Register a custom strategy
 * registry.register(new CustomRecoveryStrategy());
 *
 * // Attempt recovery
 * const recoveredCode = registry.attemptRecovery(error, originalCode);
 * if (recoveredCode) {
 *   console.log('Recovery successful');
 * }
 * ```
 */
export class RecoveryStrategyRegistry {
  private strategies: RecoveryStrategy[] = [];

  /**
   * Creates a new RecoveryStrategyRegistry with default strategies
   */
  constructor() {
    this.registerDefaultStrategies();
  }

  /**
   * Registers the default recovery strategies
   */
  private registerDefaultStrategies(): void {
    this.register(new MissingSemicolonStrategy());
    this.register(new UnclosedBracketStrategy());
    this.register(new UnknownIdentifierStrategy());
    // Note: TypeMismatchStrategy not included by default due to TypeChecker dependency
  }

  /**
   * Registers a new recovery strategy
   * @param strategy - The recovery strategy to register
   */
  register(strategy: RecoveryStrategy): void {
    if (!this.strategies.includes(strategy)) {
      this.strategies.push(strategy);
    }
  }

  /**
   * Unregisters a recovery strategy
   * @param strategy - The recovery strategy to unregister
   */
  unregister(strategy: RecoveryStrategy): void {
    const index = this.strategies.indexOf(strategy);
    if (index !== -1) {
      this.strategies.splice(index, 1);
    }
  }

  /**
   * Gets all registered strategies
   * @returns Array of registered recovery strategies
   */
  getStrategies(): readonly RecoveryStrategy[] {
    return [...this.strategies];
  }

  /**
   * Clears all registered strategies
   */
  clear(): void {
    this.strategies = [];
  }

  /**
   * Attempts to recover from an error using registered strategies
   * @param error - The error to recover from
   * @param code - The original source code
   * @returns The recovered code if successful, null otherwise
   */
  attemptRecovery(error: ParserError, code: string): string | null {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(error)) {
        try {
          const recoveredCode = strategy.recover(error, code);
          if (recoveredCode && recoveredCode !== code) {
            return recoveredCode;
          }
        } catch (recoveryError) {
          // Strategy failed, continue to next strategy
          console.warn(`Recovery strategy ${strategy.constructor.name} failed:`, recoveryError);
        }
      }
    }
    return null;
  }

  /**
   * Gets recovery suggestions for an error
   * @param error - The error to get suggestions for
   * @returns Array of recovery suggestions
   */
  getRecoverySuggestions(error: ParserError): string[] {
    const suggestions: string[] = [];

    for (const strategy of this.strategies) {
      if (strategy.canHandle(error)) {
        try {
          const suggestion = strategy.getRecoverySuggestion(error);
          if (suggestion) {
            suggestions.push(suggestion);
          }
        } catch (suggestionError) {
          // Strategy failed to provide suggestion, continue
          console.warn(`Strategy ${strategy.constructor.name} failed to provide suggestion:`, suggestionError);
        }
      }
    }

    return suggestions;
  }

  /**
   * Finds the first strategy that can handle the given error
   * @param error - The error to find a strategy for
   * @returns The first matching strategy, or null if none found
   */
  findStrategy(error: ParserError): RecoveryStrategy | null {
    return this.strategies.find(strategy => strategy.canHandle(error)) || null;
  }

  /**
   * Checks if any strategy can handle the given error
   * @param error - The error to check
   * @returns True if any strategy can handle the error
   */
  canRecover(error: ParserError): boolean {
    return this.strategies.some(strategy => strategy.canHandle(error));
  }

  /**
   * Gets the number of registered strategies
   * @returns The number of registered strategies
   */
  getStrategyCount(): number {
    return this.strategies.length;
  }

  /**
   * Registers multiple strategies at once
   * @param strategies - Array of strategies to register
   */
  registerMultiple(strategies: RecoveryStrategy[]): void {
    strategies.forEach(strategy => this.register(strategy));
  }

  /**
   * Creates a new registry with the same strategies as this one
   * @returns A new registry with copied strategies
   */
  clone(): RecoveryStrategyRegistry {
    const newRegistry = new RecoveryStrategyRegistry();
    newRegistry.clear(); // Remove default strategies
    newRegistry.registerMultiple(this.strategies);
    return newRegistry;
  }
}
