/**
 * IfStatement cursor adapter for OpenSCAD AST conversion
 * 
 * Converts a tree-sitter if statement node to an AST IfStatement node
 * using cursor-based traversal for better performance and memory usage.
 */

import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode, Expression } from '../../../../types/ast-types';
import { IfStatement } from '../../../../types/openscad-ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter if statement node to an AST IfStatement node using cursor-based traversal
 * 
 * @param cursor The Tree-sitter cursor pointing to an if statement
 * @returns The AST IfStatement node
 */
export function ifStatementCursorAdapter(cursor: TreeCursor): IfStatement {
  const node = cursor.currentNode();
  
  // Default values
  let condition: Expression = {
    type: 'Unknown',
    position: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 0
    }
  };
  
  let thenBranch: ASTNode[] = [];
  let elseBranch: ASTNode[] = [];
  
  // Process if statement children
  if (node.childCount >= 2) {
    // Extract condition (first named child)
    const conditionNode = node.namedChild(0);
    if (conditionNode) {
      // Create a simple expression from the condition node
      condition = extractExpressionFromNode(conditionNode);
    }
    
    // Extract 'then' branch (second named child)
    const thenNode = node.namedChild(1);
    if (thenNode && thenNode.type === 'block') {
      thenBranch = extractBodyNodes(thenNode);
    }
    
    // Extract 'else' branch if present (third named child)
    const elseNode = node.namedChild(2);
    if (elseNode && elseNode.type === 'block') {
      elseBranch = extractBodyNodes(elseNode);
    }
  }
  
  // Construct and return the IfStatement node
  return {
    type: 'IfStatement',
    condition,
    thenBranch, 
    elseBranch: elseBranch.length > 0 ? elseBranch : undefined,
    position: extractPositionFromCursor(cursor)
  };
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
