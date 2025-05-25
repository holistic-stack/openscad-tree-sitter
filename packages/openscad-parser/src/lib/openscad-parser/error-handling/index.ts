/**
 * @file Main export file for error handling functionality.
 * @module openscad-parser/error-handling
 */

// Export error types
export * from './types/error-types';

// Export core error handling classes
export { ErrorHandler, type ErrorHandlerOptions } from './error-handler';
export { Logger, type LoggerOptions } from './logger';
export { RecoveryStrategyRegistry } from './recovery-strategy-registry';

// Export recovery strategies
export * from './strategies/recovery-strategy';
export * from './strategies/missing-semicolon-strategy';
export * from './strategies/unclosed-bracket-strategy';
export * from './strategies/unknown-identifier-strategy';
// Note: type-mismatch-strategy not exported by default due to TypeChecker dependency
