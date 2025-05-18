import { TreeSitterNode, TreeCursor } from '../../../../types/cst-types';
import { ASTNode, BinaryExpression, Expression } from '../../../../types/ast-types';
import { extractPositionFromCursor } from '../../position-extractor/cursor-position-extractor';

/**
 * Adapts a tree-sitter binary expression node to an AST BinaryExpression node using cursor-based traversal
 * 
 * This implementation avoids recursive traversal patterns to prevent memory leaks
 * and improve performance with complex expressions.
 * 
 * @param cursor The Tree-sitter cursor pointing to a binary expression node
 * @returns The AST BinaryExpression node
 */
export function binaryExpressionCursorAdapter(cursor: TreeCursor): BinaryExpression {
  const node = cursor.currentNode();
  
  // Extract the operator from the second child (index 1)
  const operatorNode = node.child(1);
  const operator = operatorNode ? operatorNode.type : '+'; // Default to + if not found
  
  // Process left operand (first child - index 0)
  const leftNode = node.child(0);
  const left = createExpressionNode(leftNode);
  
  // Process right operand (third child - index 2)
  const rightNode = node.child(2);
  const right = createExpressionNode(rightNode);
  
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    position: extractPositionFromCursor(cursor)
  };
}

/**
 * Creates a basic expression node from a TreeSitterNode
 * 
 * @param node The tree-sitter node to convert to an AST expression node
 * @returns A basic Expression AST node
 */
function createExpressionNode(node: TreeSitterNode | null): Expression {
  if (!node) {
    // Create a placeholder node if the operand is missing
    return {
      type: 'Unknown',
      position: {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 0
      }
    };
  }
  
  // Create a basic expression node based on the node type
  return {
    type: mapNodeTypeToExpressionType(node.type),
    position: {
      startLine: node.startPosition.row,
      startColumn: node.startPosition.column,
      endLine: node.endPosition.row,
      endColumn: node.endPosition.column
    }
  };
}

/**
 * Maps a tree-sitter node type to an AST expression type
 * 
 * @param nodeType The tree-sitter node type
 * @returns The corresponding AST node type
 */
function mapNodeTypeToExpressionType(nodeType: string): string {
  switch (nodeType) {
    case 'number':
    case 'string':
    case 'boolean':
      return 'LiteralExpression';
    case 'identifier':
      return 'IdentifierExpression';
    case 'binary_expression':
      return 'BinaryExpression';
    case 'call_expression':
      return 'CallExpression';
    default:
      // For unknown node types, use the original type
      return nodeType;
  }
}
