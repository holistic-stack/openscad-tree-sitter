import { TreeSitterNode, ASTNode, Program } from '../../../../types';
import { extractPosition } from '../../utils';

/**
 * Adapts a tree-sitter program node to an AST program node
 * 
 * @param node The tree-sitter program node
 * @param adaptNode Function to adapt child nodes (dependency injection for testability)
 * @returns The AST program node
 */
export function adaptProgram(
  node: TreeSitterNode, 
  adaptNode: (node: TreeSitterNode) => ASTNode
): Program {
  const children: ASTNode[] = [];
  
  // Process each relevant child node
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child && child.isNamed && child.type !== ';') {
      children.push(adaptNode(child));
    }
  }

  return {
    type: 'Program',
    position: extractPosition(node),
    children,
  };
}
