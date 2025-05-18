/**
 * IntersectionOperation cursor adapter for OpenSCAD AST conversion
 * 
 * Converts a tree-sitter intersection operation node to an AST IntersectionOperation node
 * using cursor-based traversal for better performance and memory usage.
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode } from '../../../../types/ast-types';
import { IntersectionOperation } from '../../../../types/openscad-ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter intersection operation node to an AST IntersectionOperation node using cursor-based traversal
 * 
 * @param cursor The Tree-sitter cursor pointing to an intersection operation statement
 * @returns The AST IntersectionOperation node
 */
export function intersectionCursorAdapter(cursor: TreeCursor): IntersectionOperation {
  const node = cursor.currentNode();
  const children: ASTNode[] = [];

  // Extract children from the block statement (third child of operation_statement)
  if (node.childCount >= 3) {
    const blockNode = node.child(2);
    
    if (blockNode && blockNode.type === 'block_statement') {
      // Process each child in the block statement
      for (let i = 0; i < blockNode.childCount; i++) {
        const childNode = blockNode.child(i);
        
        if (childNode) {
          // Create a basic AST node representing the call expression
          const childAst: ASTNode = {
            type: 'CallExpression',
            position: {
              startLine: childNode.startPosition.row,
              startColumn: childNode.startPosition.column,
              endLine: childNode.endPosition.row,
              endColumn: childNode.endPosition.column
            }
          };
          children.push(childAst);
        }
      }
    }
  }

  // Create and return the IntersectionOperation node
  return {
    type: 'IntersectionOperation',
    children,
    position: extractPositionFromCursor(cursor)
  };
}
