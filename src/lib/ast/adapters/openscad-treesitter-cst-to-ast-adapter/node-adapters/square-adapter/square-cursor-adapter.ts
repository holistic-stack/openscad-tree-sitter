/**
 * Square2D cursor adapter for OpenSCAD AST conversion
 * 
 * Converts a tree-sitter square node to an AST Square2D node
 * using cursor-based traversal for better performance and memory usage.
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { Expression, LiteralExpression, VectorExpression } from '../../../../types/ast-types';
import { Square2D } from '../../../../types/openscad-ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter square node to an AST Square2D node using cursor-based traversal
 * 
 * @param cursor The Tree-sitter cursor pointing to a square call expression
 * @returns The AST Square2D node
 */
export function squareCursorAdapter(cursor: TreeCursor): Square2D {
  const node = cursor.currentNode();
  
  // Default values for square parameters
  let size: { x: Expression, y: Expression } = {
    x: createDefaultLiteralExpression(1),
    y: createDefaultLiteralExpression(1)
  };
  let center: boolean = false;
  
  // Process arguments if present
  if (node.childCount >= 2) {
    const argumentsNode = node.child(1);
    
    if (argumentsNode && argumentsNode.type === 'arguments') {
      // Process each argument
      for (let i = 0; i < argumentsNode.childCount; i++) {
        const argNode = argumentsNode.child(i);
        
        if (argNode && argNode.type === 'argument' && argNode.childCount >= 2) {
          const nameNode = argNode.child(0);
          const valueNode = argNode.child(1);
          
          if (nameNode && valueNode && nameNode.type === 'identifier') {
            const paramName = nameNode.text;
            
            switch (paramName) {
              case 'size':
                if (valueNode.type === 'vector_expression' && valueNode.childCount >= 2) {
                  // Handle vector size parameter [x, y]
                  const xNode = valueNode.child(0);
                  const yNode = valueNode.child(1);
                  
                  if (xNode && yNode) {
                    const xExpr = extractExpressionFromNode(xNode);
                    const yExpr = extractExpressionFromNode(yNode);
                    
                    size = { x: xExpr, y: yExpr };
                  }
                } else {
                  // Handle single size value - same for both x and y
                  const sizeExpr = extractExpressionFromNode(valueNode);
                  size = { x: sizeExpr, y: sizeExpr };
                }
                break;
              case 'center':
                // Center parameter
                if (valueNode.type === 'true') {
                  center = true;
                } else if (valueNode.type === 'false') {
                  center = false;
                }
                break;
            }
          }
        }
      }
    }
  }
  
  // Construct and return the Square2D node
  return {
    type: 'Square2D',
    size,
    center,
    position: extractPositionFromCursor(cursor)
  };
}

/**
 * Creates a default literal expression with a given number value
 * 
 * @param value The number value
 * @returns A LiteralExpression with the specified value
 */
function createDefaultLiteralExpression(value: number): LiteralExpression {
  return {
    type: 'LiteralExpression',
    valueType: 'number',
    value,
    position: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 0
    }
  } as Expression;
}

/**
 * Extracts an expression from a tree-sitter node
 * 
 * @param node The tree-sitter node to extract an expression from
 * @returns An AST Expression node
 */
function extractExpressionFromNode(node: TreeSitterNode): Expression {
  switch (node.type) {
    case 'number':
      return {
        type: 'LiteralExpression',
        valueType: 'number',
        value: parseFloat(node.text),
        position: {
          startLine: node.startPosition.row,
          startColumn: node.startPosition.column,
          endLine: node.endPosition.row,
          endColumn: node.endPosition.column
        }
      } as Expression;
    case 'string':
      return {
        type: 'LiteralExpression',
        valueType: 'string',
        value: node.text.slice(1, -1), // Remove quotes
        position: {
          startLine: node.startPosition.row,
          startColumn: node.startPosition.column,
          endLine: node.endPosition.row,
          endColumn: node.endPosition.column
        }
      } as Expression;
    case 'true':
      return {
        type: 'LiteralExpression',
        valueType: 'boolean',
        value: true,
        position: {
          startLine: node.startPosition.row,
          startColumn: node.startPosition.column,
          endLine: node.endPosition.row,
          endColumn: node.endPosition.column
        }
      } as Expression;
    case 'false':
      return {
        type: 'LiteralExpression',
        valueType: 'boolean',
        value: false,
        position: {
          startLine: node.startPosition.row,
          startColumn: node.startPosition.column,
          endLine: node.endPosition.row,
          endColumn: node.endPosition.column
        }
      } as Expression;
    case 'identifier':
      return {
        type: 'IdentifierExpression',
        name: node.text,
        position: {
          startLine: node.startPosition.row,
          startColumn: node.startPosition.column,
          endLine: node.endPosition.row,
          endColumn: node.endPosition.column
        }
      } as Expression;
    default:
      // For unhandled types, return a generic expression
      return {
        type: 'Unknown',
        position: {
          startLine: node.startPosition.row,
          startColumn: node.startPosition.column,
          endLine: node.endPosition.row,
          endColumn: node.endPosition.column
        }
      };
  }
}
