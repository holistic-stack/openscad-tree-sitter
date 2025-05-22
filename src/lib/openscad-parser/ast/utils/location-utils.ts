import { Node as TSNode, Point } from 'web-tree-sitter';
import * as ast from '../ast-types';

/**
 * Convert a tree-sitter Point to a Position
 * @param point The tree-sitter Point
 * @param offset Optional character offset
 * @returns The Position
 */
export function pointToPosition(point: Point, offset: number = 0): ast.Position {
  return {
    line: point.row,
    column: point.column,
    offset: offset
  };
}

/**
 * Get the location information from a node
 * @param node The node to get the location from
 * @returns The location object
 */
export function getLocation(node: TSNode): ast.SourceLocation {
  // Check if the node has startPosition and endPosition properties
  // This is needed for mock nodes in tests
  if (node.startPosition && node.endPosition) {
    // Calculate approximate character offsets
    // This is a simplification - in a real implementation, you would need to
    // calculate the actual character offsets based on the source code
    const startOffset = node.startIndex;
    const endOffset = node.endIndex;

    return {
      start: {
        line: node.startPosition.row,
        column: node.startPosition.column,
        offset: startOffset
      },
      end: {
        line: node.endPosition.row,
        column: node.endPosition.column,
        offset: endOffset
      }
    };
  }

  // Return a default location for mock nodes in tests
  return {
    start: {
      line: 0,
      column: 0,
      offset: 0
    },
    end: {
      line: 0,
      column: 0,
      offset: 0
    }
  };
}
