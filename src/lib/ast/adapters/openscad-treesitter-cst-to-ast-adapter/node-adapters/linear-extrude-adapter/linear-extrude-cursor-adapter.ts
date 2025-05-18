/**
 * LinearExtrudeTransform cursor adapter for OpenSCAD AST conversion
 * 
 * Converts a tree-sitter linear_extrude transformation node to an AST LinearExtrudeTransform node
 * using cursor-based traversal for better performance and memory usage.
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode, Expression, LiteralExpression } from '../../../../types/ast-types';
import { LinearExtrudeTransform } from '../../../../types/openscad-ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter linear_extrude transformation node to an AST LinearExtrudeTransform node using cursor-based traversal
 * 
 * @param cursor The Tree-sitter cursor pointing to a linear_extrude transform statement
 * @returns The AST LinearExtrudeTransform node
 */
export function linearExtrudeCursorAdapter(cursor: TreeCursor): LinearExtrudeTransform {
  const node = cursor.currentNode();
  const children: ASTNode[] = [];
  
  // Default values for required parameters
  let height: Expression = createDefaultLiteralExpression(1);
  
  // Optional parameters
  let center: Expression | undefined;
  let convexity: Expression | undefined;
  let twist: Expression | undefined;
  let slices: Expression | undefined;
  let scale: Expression | undefined;
  let fn: Expression | undefined;
  let fa: Expression | undefined;
  let fs: Expression | undefined;
  
  // Extract parameters from arguments node (second child of transform_statement)
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
              case 'height':
                height = value;
                break;
              case 'center':
                center = value;
                break;
              case 'convexity':
                convexity = value;
                break;
              case 'twist':
                twist = value;
                break;
              case 'slices':
                slices = value;
                break;
              case 'scale':
                scale = value;
                break;
              case '$fn':
                fn = value;
                break;
              case '$fa':
                fa = value;
                break;
              case '$fs':
                fs = value;
                break;
            }
          }
        }
      }
    }
  }
  
  // Extract children from block statement (third child of transform_statement)
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
  
  // Create and return the LinearExtrudeTransform node
  const linearExtrude: LinearExtrudeTransform = {
    type: 'LinearExtrudeTransform',
    height,
    children,
    position: extractPositionFromCursor(cursor)
  };
  
  // Add optional parameters if specified
  if (center) linearExtrude.center = center;
  if (convexity) linearExtrude.convexity = convexity;
  if (twist) linearExtrude.twist = twist;
  if (slices) linearExtrude.slices = slices;
  if (scale) linearExtrude.scale = scale;
  if (fn) linearExtrude.$fn = fn;
  if (fa) linearExtrude.$fa = fa;
  if (fs) linearExtrude.$fs = fs;
  
  return linearExtrude;
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
    case 'array':
      // For array literals (e.g., scale=[1, 0.5])
      return {
        type: 'LiteralExpression',
        valueType: 'array',
        value: node.text,
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
