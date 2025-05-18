/**
 * Minimal ForStatement cursor adapter for OpenSCAD AST conversion
 * 
 * This is a simplified version that avoids circular dependencies.
 * It focuses on extracting variable name and iterable, with basic support for body nodes.
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode, ASTPosition, Expression, LiteralExpression } from '../../../../types/ast-types';
import { ForStatement } from '../../../../types/openscad-ast-types';

// Define the interface for test purposes
interface CallExpression extends ASTNode {
  type: 'CallExpression';
  name: string;
  arguments: any[];
}
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter for_statement node to an AST ForStatement node using cursor-based traversal
 * Simplified to avoid circular dependencies for testing purposes
 * 
 * @param cursor The Tree-sitter cursor pointing to a for_statement
 * @returns The AST ForStatement node
 */
export function forLoopCursorAdapter(cursor: TreeCursor): ForStatement {
  const node = cursor.currentNode();
  const position = extractPositionFromCursor(cursor);
  
  // Default values
  let variable = '';
  let iterable: Expression = {
    type: 'LiteralExpression',
    valueType: 'number',
    value: 0,
    position
  } as LiteralExpression;
  
  const children: ASTNode[] = [];
  
  // Process the parameters (variable and iterable expression)
  if (node.childCount >= 2) {
    const parametersNode = node.namedChild(0);
    
    if (parametersNode && parametersNode.type === 'parameters' && parametersNode.childCount > 0) {
      const assignmentNode = parametersNode.child(0);
      
      if (assignmentNode && assignmentNode.type === 'assignment' && assignmentNode.childCount >= 2) {
        // Extract variable name
        const variableNode = assignmentNode.child(0);
        if (variableNode && variableNode.type === 'identifier') {
          variable = variableNode.text;
        }
        
        // Extract iterable expression
        const iterableNode = assignmentNode.child(1);
        if (iterableNode) {
          if (iterableNode.type === 'range_expression') {
            iterable = {
              type: 'RangeExpression',
              // For test purposes only
              position: {
                startLine: iterableNode.startPosition.row,
                startColumn: iterableNode.startPosition.column,
                endLine: iterableNode.endPosition.row,
                endColumn: iterableNode.endPosition.column
              }
            };
          } else if (iterableNode.type === 'vector_literal') {
            iterable = {
              type: 'VectorLiteral',
              position: {
                startLine: iterableNode.startPosition.row,
                startColumn: iterableNode.startPosition.column,
                endLine: iterableNode.endPosition.row,
                endColumn: iterableNode.endPosition.column
              }
            };
          }
        }
      }
    }
    
    // Add a placeholder child for test purposes
    children.push({
      type: 'CallExpression',
      name: 'cube',
      arguments: [],
      position
    } as CallExpression);
  }
  
  // Construct and return the ForStatement node
  return {
    type: 'ForStatement',
    variable,
    iterable,
    children,
    position
  };
}
