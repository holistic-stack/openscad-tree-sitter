import { TreeSitterNode, ASTNode, AssignmentStatement, Expression, IdentifierExpression, LiteralExpression } from '../../../../types';
import { extractPosition } from '../../utils';

/**
 * Adapts a tree-sitter assignment node to an AST assignment statement node
 * 
 * @param node The tree-sitter assignment node
 * @param adaptNode Function to adapt child nodes (dependency injection for testability)
 * @returns The AST assignment statement node
 */
export function adaptAssignment(
  node: TreeSitterNode, 
  adaptNode: (node: TreeSitterNode) => ASTNode
): AssignmentStatement {
  // Find the left and right sides of the assignment
  // The first child is typically the identifier (left side)
  // The third child is typically the expression (right side)
  // The second child is the equals sign
  
  const leftNode = node.child(0);
  // Skip equals sign at index 1
  const rightNode = node.child(2);
  
  let left: IdentifierExpression;
  if (leftNode && leftNode.type === 'identifier') {
    left = adaptNode(leftNode) as IdentifierExpression;
  } else {
    // Fallback if no left side identifier is found
    left = {
      type: 'IdentifierExpression',
      name: 'unknown',
      position: extractPosition(node),
    };
  }
  
  let right: Expression;
  if (rightNode) {
    right = adaptNode(rightNode) as Expression;
  } else {
    // Fallback if no right side expression is found
    right = {
      type: 'LiteralExpression',
      valueType: 'number',
      value: 0,
      position: extractPosition(node),
    } as LiteralExpression;
  }
  
  return {
    type: 'AssignmentStatement',
    left,
    right,
    position: extractPosition(node),
  };
}
