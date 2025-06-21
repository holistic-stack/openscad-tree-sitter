/**
 * @file Node location utilities for tracking source code positions
 *
 * This module provides utilities for tracking and managing source code positions
 * within parsed OpenSCAD files. It enables precise error reporting, syntax highlighting,
 * and editor integration by maintaining accurate line/column and character offset information.
 *
 * @module node-location
 * @since 0.1.0
 */

/**
 * Represents a location range within source code, providing both line/column
 * and character offset information for precise positioning.
 *
 * This class is used throughout the parser to track the exact location of AST nodes
 * in the original source code, enabling features like:
 * - Precise error reporting with line and column numbers
 * - Syntax highlighting in editors
 * - Go-to-definition functionality
 * - Incremental parsing optimizations
 *
 * The location information includes both human-readable line/column positions
 * (1-based for lines, 0-based for columns) and zero-based character offsets
 * for efficient string operations.
 *
 * @example Creating a location for a simple token
 * ```typescript
 * const location = new NodeLocation(
 *   { row: 1, column: 0 },    // Start at line 1, column 0
 *   { row: 1, column: 4 },    // End at line 1, column 4
 *   0,                        // Character offset 0
 *   4                         // Character offset 4
 * );
 *
 * // Represents the token "cube" at the beginning of line 1
 * console.log(`Token spans ${location.endIndex - location.startIndex} characters`);
 * ```
 *
 * @example Using with Tree-sitter nodes
 * ```typescript
 * import { NodeLocation } from '@holistic-stack/openscad-parser';
 *
 * function createLocationFromNode(node: TreeSitter.SyntaxNode): NodeLocation {
 *   return new NodeLocation(
 *     { row: node.startPosition.row, column: node.startPosition.column },
 *     { row: node.endPosition.row, column: node.endPosition.column },
 *     node.startIndex,
 *     node.endIndex
 *   );
 * }
 * ```
 *
 * @since 0.1.0
 * @category Core
 */
export class NodeLocation {
  /**
   * Creates a new NodeLocation instance representing a range in source code.
   *
   * @param startPosition - Starting position with row (1-based) and column (0-based)
   * @param endPosition - Ending position with row (1-based) and column (0-based)
   * @param startIndex - Zero-based character offset from start of source
   * @param endIndex - Zero-based character offset from start of source (exclusive)
   *
   * @example Basic usage
   * ```typescript
   * const location = new NodeLocation(
   *   { row: 1, column: 5 },
   *   { row: 1, column: 10 },
   *   5,
   *   10
   * );
   * ```
   *
   * @example Multi-line location
   * ```typescript
   * const multiLineLocation = new NodeLocation(
   *   { row: 1, column: 0 },
   *   { row: 3, column: 1 },
   *   0,
   *   25
   * );
   * ```
   */
  constructor(
    /** Starting position with 1-based row and 0-based column */
    public readonly startPosition: { row: number; column: number },
    /** Ending position with 1-based row and 0-based column */
    public readonly endPosition: { row: number; column: number },
    /** Zero-based character offset from start of source (inclusive) */
    public readonly startIndex: number,
    /** Zero-based character offset from start of source (exclusive) */
    public readonly endIndex: number
  ) {}

  /**
   * Gets the length of the text span represented by this location.
   *
   * @returns The number of characters between start and end indices
   *
   * @example
   * ```typescript
   * const location = new NodeLocation(
   *   { row: 1, column: 0 },
   *   { row: 1, column: 4 },
   *   0,
   *   4
   * );
   *
   * console.log(location.length); // 4
   * ```
   */
  get length(): number {
    return this.endIndex - this.startIndex;
  }

  /**
   * Checks if this location represents a single point (zero-length range).
   *
   * @returns True if start and end positions are identical
   *
   * @example
   * ```typescript
   * const point = new NodeLocation(
   *   { row: 1, column: 5 },
   *   { row: 1, column: 5 },
   *   5,
   *   5
   * );
   *
   * console.log(point.isPoint()); // true
   * ```
   */
  isPoint(): boolean {
    return this.startIndex === this.endIndex;
  }

  /**
   * Checks if this location spans multiple lines.
   *
   * @returns True if the location spans more than one line
   *
   * @example
   * ```typescript
   * const singleLine = new NodeLocation(
   *   { row: 1, column: 0 },
   *   { row: 1, column: 10 },
   *   0,
   *   10
   * );
   *
   * const multiLine = new NodeLocation(
   *   { row: 1, column: 0 },
   *   { row: 3, column: 5 },
   *   0,
   *   25
   * );
   *
   * console.log(singleLine.isMultiLine()); // false
   * console.log(multiLine.isMultiLine());  // true
   * ```
   */
  isMultiLine(): boolean {
    return this.startPosition.row !== this.endPosition.row;
  }

  /**
   * Checks if this location contains another location.
   *
   * @param other - The location to check for containment
   * @returns True if this location completely contains the other location
   *
   * @example
   * ```typescript
   * const outer = new NodeLocation(
   *   { row: 1, column: 0 },
   *   { row: 1, column: 20 },
   *   0,
   *   20
   * );
   *
   * const inner = new NodeLocation(
   *   { row: 1, column: 5 },
   *   { row: 1, column: 10 },
   *   5,
   *   10
   * );
   *
   * console.log(outer.contains(inner)); // true
   * console.log(inner.contains(outer)); // false
   * ```
   */
  contains(other: NodeLocation): boolean {
    return (
      this.startIndex <= other.startIndex &&
      this.endIndex >= other.endIndex
    );
  }

  /**
   * Checks if this location overlaps with another location.
   *
   * @param other - The location to check for overlap
   * @returns True if the locations have any overlapping characters
   *
   * @example
   * ```typescript
   * const loc1 = new NodeLocation(
   *   { row: 1, column: 0 },
   *   { row: 1, column: 10 },
   *   0,
   *   10
   * );
   *
   * const loc2 = new NodeLocation(
   *   { row: 1, column: 5 },
   *   { row: 1, column: 15 },
   *   5,
   *   15
   * );
   *
   * console.log(loc1.overlaps(loc2)); // true
   * ```
   */
  overlaps(other: NodeLocation): boolean {
    return (
      this.startIndex < other.endIndex &&
      this.endIndex > other.startIndex
    );
  }

  /**
   * Creates a string representation of this location for debugging.
   *
   * @returns A human-readable string describing the location
   *
   * @example
   * ```typescript
   * const location = new NodeLocation(
   *   { row: 1, column: 5 },
   *   { row: 1, column: 10 },
   *   5,
   *   10
   * );
   *
   * console.log(location.toString());
   * // "1:5-1:10 (5-10)"
   * ```
   */
  toString(): string {
    return `${this.startPosition.row}:${this.startPosition.column}-${this.endPosition.row}:${this.endPosition.column} (${this.startIndex}-${this.endIndex})`;
  }
}
