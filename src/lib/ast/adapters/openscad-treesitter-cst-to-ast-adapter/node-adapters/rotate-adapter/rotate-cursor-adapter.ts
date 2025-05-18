/**
 * RotateTransform cursor adapter for OpenSCAD AST conversion
 * 
 * Converts a tree-sitter rotate node to an AST RotateTransform node
 * using cursor-based traversal for better performance and memory usage.
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode, Expression, LiteralExpression } from '../../../../types/ast-types';
import { RotateTransform } from '../../../../types/openscad-ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter rotate node to an AST RotateTransform node using cursor-based traversal
 * 
 * @param cursor The Tree-sitter cursor pointing to a rotate transform statement
 * @returns The AST RotateTransform node
 */
export function rotateTransformCursorAdapter(cursor: TreeCursor): RotateTransform {
  const node = cursor.currentNode();
  
  // Default rotation angle
  let angle: Expression | [Expression, Expression, Expression] = createDefaultLiteralExpression(0);
  
  // Default empty body
  let bodyNodes: ASTNode[] = [];
  
  // Process rotation angles if present
  if (node.childCount >= 2) {
    const argumentsNode = node.child(1);
    
    if (argumentsNode && argumentsNode.type === 'arguments' && argumentsNode.childCount >= 1) {
      const firstArg = argumentsNode.child(0);
      
      if (firstArg) {
        if (firstArg.type === 'vector_expression' && firstArg.childCount >= 3) {
          // Handle vector format [x, y, z]
          const xNode = firstArg.child(0);
          const yNode = firstArg.child(1);
          const zNode = firstArg.child(2);
          
          if (xNode && yNode && zNode) {
            // Create a vector of expressions for x, y, z angles
            angle = [
              extractExpressionFromNode(xNode),
              extractExpressionFromNode(yNode),
              extractExpressionFromNode(zNode)
            ];
          }
        } else if (firstArg.type === 'number') {
          // Handle scalar format (rotation around z-axis only)
          angle = extractExpressionFromNode(firstArg);
        }
      }
    }
  }
  
  // Extract body nodes if present
  if (node.childCount >= 3) {
    const bodyNode = node.child(2);
    
    if (bodyNode) {
      if (bodyNode.type === 'block') {
        // Handle block with multiple children
        bodyNodes = extractBodyNodes(bodyNode);
      } else {
        // Handle single child (without block)
        bodyNodes = [createSimpleAstNode(bodyNode)];
      }
    }
  }
  
  // Construct and return the RotateTransform node
  return {
    type: 'RotateTransform',
    angle,
    children: bodyNodes,
    position: extractPositionFromCursor(cursor)
  };
}

/**
 * Creates a default literal expression with a given number value
 * 
 * @param value The number value
 * @returns A LiteralExpression
 */
function createDefaultLiteralExpression(value: number): Expression {
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
 * Extracts body nodes from a block node
 * 
 * @param blockNode The block node containing child nodes
 * @returns An array of AST nodes
 */
function extractBodyNodes(blockNode: TreeSitterNode): ASTNode[] {
  const nodes: ASTNode[] = [];
  
  // Process each child in the block
  for (let i = 0; i < blockNode.childCount; i++) {
    const child = blockNode.child(i);
    if (child) {
      // Create a basic AST node representing the child
      const childAst: ASTNode = {
        type: 'CallExpression',
        position: {
          startLine: child.startPosition.row,
          startColumn: child.startPosition.column,
          endLine: child.endPosition.row,
          endColumn: child.endPosition.column
        }
      };
      nodes.push(childAst);
    }
  }
  
  return nodes;
}

/**
 * Creates a simple AST node from a CST node
 * 
 * @param node The CST node to convert
 * @returns A basic AST node
 */
function createSimpleAstNode(node: TreeSitterNode): ASTNode {
  return {
    type: 'CallExpression',
    position: {
      startLine: node.startPosition.row,
      startColumn: node.startPosition.column,
      endLine: node.endPosition.row,
      endColumn: node.endPosition.column
    }
  };
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
