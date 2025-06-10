/**
 * @file Type definitions for IDE symbol provider features.
 * @module ide-support/symbol-provider/symbol-types
 */

import type {
  ASTNode,
  SourceLocation,
  Parameter,
  Position,
} from '../../openscad-parser/ast/ast-types.js';

/**
 * Represents information about a symbol in the OpenSCAD code.
 */
export interface SymbolInfo {
  /** The name of the symbol (e.g., variable name, function name, module name). */
  name: string;
  /** The kind of the symbol. */
  kind: 'module' | 'function' | 'variable' | 'parameter' | 'constant';
  /** The general location of the entire symbol definition (e.g., the whole function or module block). */
  loc: SourceLocation;
  /** Optional: The specific location of the symbol's name identifier. */
  nameLoc?: SourceLocation;
  /** The scope in which the symbol is defined (e.g., module name for parameters or local variables). */
  scope?: string;
  /** For functions or modules, the list of parameters they accept. */
  parameters?: Parameter[];
  /** For constants or variables with evaluated expressions, their value. */
  value?: any; // Consider a more specific type if possible later
  /** Optional documentation string for the symbol. */
  documentation?: string;
}

/**
 * Defines the contract for a symbol provider service.
 * This service is responsible for extracting symbol information from an AST.
 */
export interface SymbolProvider {
  /**
   * Retrieves all symbols defined in the given Abstract Syntax Tree (AST).
   * @param ast - An array of AST nodes representing the parsed OpenSCAD document.
   * @returns An array of SymbolInfo objects.
   */
  getSymbols(ast: ASTNode[]): SymbolInfo[];

  /**
   * Retrieves the symbol defined at a specific position in the source code.
   * @param ast - An array of AST nodes representing the parsed OpenSCAD document.
   * @param position - The position (line and column) in the source code.
   * @returns A SymbolInfo object if a symbol is found at the position, otherwise null.
   */
  getSymbolAtPosition(ast: ASTNode[], position: Position): SymbolInfo | null;
}
