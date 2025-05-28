/**
 * @file Main export file for error handling functionality.
 * @module openscad-parser/error-handling
 */

// Export error types
export * from './types/error-types.js';

// Export core error handling classes
export { ErrorHandler, type ErrorHandlerOptions } from './error-handler.js';
export { Logger, type LoggerOptions } from './logger.js';
export { RecoveryStrategyRegistry } from './recovery-strategy-registry.js';

// Export recovery strategies
export * from './strategies/recovery-strategy.js';
export * from './strategies/missing-semicolon-strategy.js';
export * from './strategies/unclosed-bracket-strategy.js';
export * from './strategies/unknown-identifier-strategy.js';
// Note: type-mismatch-strategy not exported by default due to TypeChecker dependency
