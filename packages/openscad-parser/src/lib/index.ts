/**
 * @file Main entry point for the OpenSCAD Parser library
 *
 * This module exports all public APIs for parsing OpenSCAD code, including:
 * - OpenSCAD parser with AST generation
 * - Error handling utilities
 * - AST node types and utilities
 * - IDE support features
 *
 * @module @openscad/parser
 * @since 0.1.0
 */

// Core parser classes
export { OpenscadParser } from './openscad-parser/openscad-parser';

// Legacy export for backward compatibility
export { OpenscadParser as EnhancedOpenscadParser } from './openscad-parser/openscad-parser';

// Error handling
export { SimpleErrorHandler, type IErrorHandler } from './openscad-parser/error-handling/simple-error-handler';
export { ErrorHandler } from './openscad-parser/error-handling/error-handler';

// AST types and utilities
export * from './openscad-parser/ast/ast-types';
export * from './openscad-parser/ast/utils';
export * from './openscad-parser/ast/extractors';

// IDE support features
export * from './ide-support/index';

// Node location utilities
export * from './node-location';
