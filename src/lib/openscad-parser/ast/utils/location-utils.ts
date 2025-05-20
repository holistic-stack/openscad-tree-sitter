import { Node } from 'web-tree-sitter';
import * as ast from '../ast-types';

// Type alias for web-tree-sitter's Node type
export type TSNode = Node;

/**
 * Get the source location of a node
 */
export function getLocation(node: TSNode): ast.SourceLocation {
  return {
    start: {
      line: node.startPosition.row,
      column: node.startPosition.column,
      offset: node.startIndex
    },
    end: {
      line: node.endPosition.row,
      column: node.endPosition.column,
      offset: node.endIndex
    },
    text: node.text
  };
}
