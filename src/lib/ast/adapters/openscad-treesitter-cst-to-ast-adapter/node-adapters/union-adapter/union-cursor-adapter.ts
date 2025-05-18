/**
 * UnionOperation cursor adapter for OpenSCAD AST conversion
 * 
 * Converts a tree-sitter union node to an AST UnionOperation node
 * using cursor-based traversal for better performance and memory usage.
 * 
 * Following Test-Driven Development principles, this implementation ensures:
 * - Correct handling of union operations
 * - Proper extraction of child nodes
 * - Accurate position information
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode, ASTPosition, CallExpression, IdentifierExpression } from '../../../../types/ast-types';
import { UnionOperation } from '../../../../types/openscad-ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter union node to an AST UnionOperation node using cursor-based traversal
 * 
 * @param cursor The Tree-sitter cursor pointing to a union operation statement
 * @returns The AST UnionOperation node
 */
export function unionCursorAdapter(cursor: TreeCursor): UnionOperation {
  const node = cursor.currentNode();
  const position = extractPositionFromCursor(cursor);
  
  // Default empty children array
  let children: ASTNode[] = [];
  
  // Extract child nodes if present
  if (node.childCount >= 3) {
    const bodyNode = node.child(2);
    
    if (bodyNode && bodyNode.type === 'block') {
      // Process each child in the block
      for (let i = 0; i < bodyNode.childCount; i++) {
        const child = bodyNode.child(i);
        if (child && child.isNamed) {
          // Create a simple call expression for each child in the union
          if (child.type === 'call_expression') {
            const callExprPosition: ASTPosition = {
              startLine: child.startPosition.row,
              startColumn: child.startPosition.column,
              endLine: child.endPosition.row,
              endColumn: child.endPosition.column
            };
            
            // Create an identifier for the callee
            const identifierNode = child.child(0);
            const callee: IdentifierExpression = {
              type: 'IdentifierExpression',
              name: identifierNode ? identifierNode.text : 'unknown',
              position: {
                startLine: identifierNode ? identifierNode.startPosition.row : child.startPosition.row,
                startColumn: identifierNode ? identifierNode.startPosition.column : child.startPosition.column,
                endLine: identifierNode ? identifierNode.endPosition.row : child.startPosition.row,
                endColumn: identifierNode ? identifierNode.endPosition.column : child.startPosition.column + 1
              }
            };
            
            // Create a call expression
            const callExpr: CallExpression = {
              type: 'CallExpression',
              callee,
              arguments: [],
              position: callExprPosition
            };
            
            children.push(callExpr);
          } else {
            // For other types, create a basic node with position info
            children.push({
              type: 'Unknown',
              position: {
                startLine: child.startPosition.row,
                startColumn: child.startPosition.column,
                endLine: child.endPosition.row,
                endColumn: child.endPosition.column
              }
            });
          }
        }
      }
    }
  }
  
  // Construct and return the UnionOperation node
  return {
    type: 'UnionOperation',
    children,
    position
  };
}
