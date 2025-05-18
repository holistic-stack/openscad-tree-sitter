/**
 * Assignment cursor adapter for OpenSCAD AST conversion
 * 
 * Converts a tree-sitter assignment node to an AST AssignmentStatement node
 * using cursor-based traversal for better performance and memory usage.
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode, Expression, AssignmentStatement, IdentifierExpression, LiteralExpression } from '../../../../types/ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';
import { adaptCstToAst } from '../../adapt-cst-to-ast';

/**
 * Adapts a tree-sitter assignment node to an AST AssignmentStatement node using cursor-based traversal
 * 
 * @param cursor The Tree-sitter cursor pointing to an assignment statement
 * @returns The AST AssignmentStatement node
 */
export function assignmentCursorAdapter(cursor: TreeCursor): AssignmentStatement {
  const node = cursor.currentNode();
  
  // Find the left and right sides of the assignment
  // The first child is typically the identifier (left side)
  // The third child is typically the expression (right side)
  // The second child is the equals sign
  
  let left: IdentifierExpression;
  let right: Expression;
  
  const leftNode = node.child(0);
  if (leftNode && leftNode.type === 'identifier') {
    try {
      left = adaptCstToAst(leftNode) as IdentifierExpression;
    } catch (error) {
      // Fallback if adaptation fails
      left = {
        type: 'IdentifierExpression',
        name: leftNode.text,
        position: {
          startLine: leftNode.startPosition.row,
          startColumn: leftNode.startPosition.column,
          endLine: leftNode.endPosition.row,
          endColumn: leftNode.endPosition.column
        }
      };
    }
  } else {
    // Fallback if no left side identifier is found
    left = {
      type: 'IdentifierExpression',
      name: 'unknown',
      position: extractPositionFromCursor(cursor)
    };
  }
  
  // Skip equals sign at index 1
  const rightNode = node.child(2);
  if (rightNode) {
    try {
      right = adaptCstToAst(rightNode) as Expression;
    } catch (error) {
      // Fallback if adaptation fails
      right = {
        type: 'LiteralExpression',
        valueType: 'number',
        value: 0,
        position: {
          startLine: rightNode.startPosition.row,
          startColumn: rightNode.startPosition.column,
          endLine: rightNode.endPosition.row,
          endColumn: rightNode.endPosition.column
        }
      } as LiteralExpression;
    }
  } else {
    // Fallback if no right side expression is found
    right = {
      type: 'LiteralExpression',
      valueType: 'number',
      value: 0,
      position: extractPositionFromCursor(cursor)
    } as LiteralExpression;
  }
  
  return {
    type: 'AssignmentStatement',
    left,
    right,
    position: extractPositionFromCursor(cursor)
  };
}
