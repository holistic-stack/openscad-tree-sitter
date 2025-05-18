/**
 * Sphere3D cursor adapter for OpenSCAD AST conversion
 * 
 * Converts a tree-sitter sphere node to an AST Sphere3D node
 * using cursor-based traversal for better performance and memory usage.
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { Expression, LiteralExpression } from '../../../../types/ast-types';
import { Sphere3D } from '../../../../types/openscad-ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter sphere node to an AST Sphere3D node using cursor-based traversal
 * 
 * @param cursor The Tree-sitter cursor pointing to a sphere call expression
 * @returns The AST Sphere3D node
 */
export function sphereCursorAdapter(cursor: TreeCursor): Sphere3D {
  const node = cursor.currentNode();
  
  // Default values for sphere parameters
  let radius: Expression = createDefaultLiteralExpression(1);
  let fn: Expression | undefined;
  let fa: Expression | undefined;
  let fs: Expression | undefined;
  
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
            const value = extractExpressionFromNode(valueNode);
            
            switch (paramName) {
              case 'r':
                // Radius parameter
                radius = value;
                break;
              case 'd':
                // Diameter parameter (convert to radius)
                if (value.type === 'LiteralExpression' && 
                    'valueType' in value && 
                    value.valueType === 'number' && 
                    'value' in value && 
                    typeof value.value === 'number') {
                  radius = createLiteralExpression(value.value / 2, valueNode);
                } else {
                  // For non-literal expressions, we'd need a more complex conversion
                  radius = value;
                }
                break;
              case '$fn':
                // Facet number special variable
                fn = value;
                break;
              case '$fa':
                // Facet angle special variable
                fa = value;
                break;
              case '$fs':
                // Facet size special variable
                fs = value;
                break;
            }
          }
        }
      }
    }
  }
  
  // Construct and return the Sphere3D node
  const sphere: Sphere3D = {
    type: 'Sphere3D',
    radius,
    position: extractPositionFromCursor(cursor)
  };
  
  // Add optional special variables if specified
  if (fn) sphere.$fn = fn;
  if (fa) sphere.$fa = fa;
  if (fs) sphere.$fs = fs;
  
  return sphere;
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
 * Creates a literal expression with position information from a node
 * 
 * @param value The numeric value
 * @param node The source node for position information
 * @returns A LiteralExpression with the specified value and position
 */
function createLiteralExpression(value: number, node: TreeSitterNode): LiteralExpression {
  return {
    type: 'LiteralExpression',
    valueType: 'number',
    value,
    position: {
      startLine: node.startPosition.row,
      startColumn: node.startPosition.column,
      endLine: node.endPosition.row,
      endColumn: node.endPosition.column
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
