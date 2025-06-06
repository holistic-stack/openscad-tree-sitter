/**
 * @file Type definitions for IDE position utilities features.
 * @module ide-support/position-utilities/position-types
 */

import type {
  ASTNode,
  SourceLocation,
  Position,
} from '../../openscad-parser/ast/ast-types.js';
import type { SymbolInfo } from '../symbol-provider/symbol-types.js';

/**
 * Represents a range in the source code with start and end positions.
 */
export interface SourceRange {
  /** The starting position of the range. */
  start: Position;
  /** The ending position of the range (exclusive). */
  end: Position;
  /** Optional text content of the range. */
  text?: string;
}

/**
 * Represents hover information for a symbol or node.
 */
export interface HoverInfo {
  /** The symbol information if available. */
  symbol?: SymbolInfo;
  /** The AST node at the position. */
  node: ASTNode;
  /** The range that the hover information covers. */
  range: SourceRange;
  /** Human-readable description of the element. */
  description: string;
  /** Optional documentation string. */
  documentation?: string;
  /** The type of the element (module, function, variable, etc.). */
  kind: 'module' | 'function' | 'variable' | 'parameter' | 'expression' | 'statement' | 'unknown';
  /** Additional contextual information. */
  context?: {
    /** The scope in which this element is defined. */
    scope?: string;
    /** Parameter information for functions/modules. */
    parameters?: Array<{
      name: string;
      type?: string;
      description?: string;
      defaultValue?: string;
    }>;
    /** Return type for functions. */
    returnType?: string;
  };
}

/**
 * Represents the context for code completion at a specific position.
 */
export interface CompletionContext {
  /** The type of completion context. */
  type: 'module_call' | 'function_call' | 'parameter' | 'expression' | 'statement' | 'assignment' | 'unknown';
  /** Available symbols in the current scope. */
  availableSymbols: SymbolInfo[];
  /** Expected type for the completion (if known). */
  expectedType?: string;
  /** Parameter index if inside a function/module call. */
  parameterIndex?: number;
  /** The AST node at the completion position. */
  node?: ASTNode;
  /** The parent node context. */
  parentNode?: ASTNode;
  /** Whether we're inside a string literal. */
  inString?: boolean;
  /** Whether we're inside a comment. */
  inComment?: boolean;
  /** The current line content up to the cursor. */
  linePrefix?: string;
  /** The word being typed (if any). */
  wordAtCursor?: string;
}

/**
 * Defines the contract for position utilities service.
 * This service provides position-based operations on AST nodes.
 */
export interface PositionUtilities {
  /**
   * Finds the AST node at a specific position in the source code.
   * @param ast - An array of AST nodes representing the parsed OpenSCAD document.
   * @param position - The position (line and column) in the source code.
   * @returns The AST node at the position, or null if none found.
   */
  findNodeAt(ast: ASTNode[], position: Position): ASTNode | null;

  /**
   * Gets the source range for an AST node.
   * @param node - The AST node to get the range for.
   * @returns The source range of the node.
   */
  getNodeRange(node: ASTNode): SourceRange;

  /**
   * Gets hover information for an AST node.
   * @param node - The AST node to get hover information for.
   * @returns Hover information for the node, or null if not available.
   */
  getHoverInfo(node: ASTNode): HoverInfo | null;

  /**
   * Gets the completion context at a specific position.
   * @param ast - An array of AST nodes representing the parsed OpenSCAD document.
   * @param position - The position (line and column) in the source code.
   * @returns The completion context at the position.
   */
  getCompletionContext(ast: ASTNode[], position: Position): CompletionContext;

  /**
   * Checks if a position is within a source range.
   * @param position - The position to check.
   * @param range - The range to check against.
   * @returns True if the position is within the range.
   */
  isPositionInRange(position: Position, range: SourceRange): boolean;

  /**
   * Finds all nodes that contain a specific position.
   * @param ast - An array of AST nodes representing the parsed OpenSCAD document.
   * @param position - The position to search for.
   * @returns An array of nodes that contain the position, ordered from outermost to innermost.
   */
  findNodesContaining(ast: ASTNode[], position: Position): ASTNode[];
}
