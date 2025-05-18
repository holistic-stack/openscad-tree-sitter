/**
 * Cylinder3D cursor adapter for OpenSCAD AST conversion
 * 
 * Converts a tree-sitter cylinder node to an AST Cylinder3D node
 * using cursor-based traversal for better performance and memory usage.
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { Expression, LiteralExpression } from '../../../../types/ast-types';
import { Cylinder3D } from '../../../../types/openscad-ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter cylinder node to an AST Cylinder3D node using cursor-based traversal
 * 
 * @param cursor The Tree-sitter cursor pointing to a cylinder call expression
 * @returns The AST Cylinder3D node
 */
export function cylinderCursorAdapter(cursor: TreeCursor): Cylinder3D {
  const node = cursor.currentNode();
  
  // Default values for cylinder parameters
  let height: Expression = createDefaultLiteralExpression(1);
  let radius1: Expression = createDefaultLiteralExpression(1);
  let radius2: Expression | undefined;
  let center: boolean | undefined;
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
              case 'h':
                // Height parameter
                height = value;
                break;
              case 'r':
                // Radius parameter (both top and bottom)
                radius1 = value;
                radius2 = value;
                break;
              case 'r1':
                // Bottom radius parameter
                radius1 = value;
                break;
              case 'r2':
                // Top radius parameter
                radius2 = value;
                break;
              case 'd':
                // Diameter parameter (both top and bottom)
                if (value.type === 'LiteralExpression' && 
                    'valueType' in value && 
                    value.valueType === 'number' && 
                    'value' in value && 
                    typeof value.value === 'number') {
                  radius1 = createLiteralExpression(value.value / 2, valueNode);
                  radius2 = createLiteralExpression(value.value / 2, valueNode);
                } else {
                  // For non-literal expressions, we'd need a more complex conversion
                  radius1 = value;
                  radius2 = value;
                }
                break;
              case 'd1':
                // Bottom diameter parameter
                if (value.type === 'LiteralExpression' && 
                    'valueType' in value && 
                    value.valueType === 'number' && 
                    'value' in value && 
                    typeof value.value === 'number') {
                  radius1 = createLiteralExpression(value.value / 2, valueNode);
                } else {
                  // For non-literal expressions, we'd need a more complex conversion
                  radius1 = value;
                }
                break;
              case 'd2':
                // Top diameter parameter
                if (value.type === 'LiteralExpression' && 
                    'valueType' in value && 
                    value.valueType === 'number' && 
                    'value' in value && 
                    typeof value.value === 'number') {
                  radius2 = createLiteralExpression(value.value / 2, valueNode);
                } else {
                  // For non-literal expressions, we'd need a more complex conversion
                  radius2 = value;
                }
                break;
              case 'center':
                // Center parameter
                if (value.type === 'LiteralExpression' && 
                    'valueType' in value && 
                    value.valueType === 'boolean' && 
                    'value' in value) {
                  center = value.value as boolean;
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
  
  // Construct and return the Cylinder3D node
  const cylinder: Cylinder3D = {
    type: 'Cylinder3D',
    height,
    radius1,
    position: extractPositionFromCursor(cursor)
  };
  
  // Add optional parameters if specified
  if (radius2) cylinder.radius2 = radius2;
  if (center !== undefined) cylinder.center = center;
  
  // Add optional special variables if specified
  if (fn) cylinder.$fn = fn;
  if (fa) cylinder.$fa = fa;
  if (fs) cylinder.$fs = fs;
  
  return cylinder;
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
