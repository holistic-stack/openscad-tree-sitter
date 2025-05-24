/**
 * @file Main export file for error handling functionality.
 * @module openscad-parser/error-handling
 */

// Export error types
export * from './types/error-types.ts';

// Export core error handling classes
export { ErrorHandler, type ErrorHandlerOptions } from './error-handler.ts';
export { Logger, type LoggerOptions } from './logger.ts';
export { RecoveryStrategyRegistry } from './recovery-strategy-registry.ts';

// Export recovery strategies
export * from './strategies/recovery-strategy.ts';
export * from './strategies/missing-semicolon-strategy.ts';
export * from './strategies/unclosed-bracket-strategy.ts';
export * from './strategies/unknown-identifier-strategy.ts';
// Note: type-mismatch-strategy not exported by default due to TypeChecker dependency
