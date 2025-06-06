/**
 * @file IDE Support module exports.
 * @module ide-support
 */

// Symbol Provider exports
export { OpenSCADSymbolProvider } from './symbol-provider/symbol-provider.js';
export type {
  SymbolProvider,
  SymbolInfo,
} from './symbol-provider/symbol-types.js';

// Position Utilities exports
export { OpenSCADPositionUtilities } from './position-utilities/position-utilities.js';
export type {
  PositionUtilities,
  SourceRange,
  HoverInfo,
  CompletionContext,
} from './position-utilities/position-types.js';
