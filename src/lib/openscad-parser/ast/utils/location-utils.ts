import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';

/**
 * Get the location information from a node
 * @param node The node to get the location from
 * @returns The location object
 */
export function getLocation(node: TSNode): ast.Location {
  // Check if the node has startPosition and endPosition properties
  // This is needed for mock nodes in tests
  if (node.startPosition && node.endPosition) {
    return {
      start: {
        line: node.startPosition.row,
        column: node.startPosition.column
      },
      end: {
        line: node.endPosition.row,
        column: node.endPosition.column
      }
    };
  }

  // Return a default location for mock nodes in tests
  return {
    start: {
      line: 0,
      column: 0
    },
    end: {
      line: 0,
      column: 0
    }
  };
}
