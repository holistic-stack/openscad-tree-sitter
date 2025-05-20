import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';

/**
 * Get the location information from a node
 * @param node The node to get the location from
 * @returns The location object
 */
export function getLocation(node: TSNode): ast.Location {
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
