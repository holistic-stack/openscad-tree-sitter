import { TreeSitterNode, ASTNode, CallExpression, Expression, IdentifierExpression } from '../../../../types';
import { extractPosition } from '../../utils';

/**
 * Adapts a tree-sitter call expression node to an AST call expression node
 * 
 * @param node The tree-sitter call expression node
 * @param adaptNode Function to adapt child nodes (dependency injection for testability)
 * @returns The AST call expression node
 */
export function adaptCallExpression(
  node: TreeSitterNode, 
  adaptNode: (node: TreeSitterNode) => ASTNode
): CallExpression {
  const calleeNode = node.child(0);
  const argumentListNode = node.child(1);
  
  let callee: IdentifierExpression;
  if (calleeNode) {
    callee = adaptNode(calleeNode) as IdentifierExpression;
  } else {
    // Fallback if no callee is found
    callee = {
      type: 'IdentifierExpression',
      name: 'unknown',
      position: extractPosition(node),
    };
  }
  
  const args: Expression[] = [];
  if (argumentListNode) {
    // Process arguments within the argument list, skipping non-expression nodes
    for (let i = 0; i < argumentListNode.childCount; i++) {
      const argNode = argumentListNode.child(i);
      if (argNode && argNode.isNamed && !['(', ')', ','].includes(argNode.type)) {
        args.push(adaptNode(argNode) as Expression);
      }
    }
  }
  
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    position: extractPosition(node),
  };
}
