import { TreeSitterNode, IdentifierExpression } from '../../../../types';
import { extractPosition } from '../../utils';

/**
 * Adapts a tree-sitter identifier node to an AST identifier expression node
 * 
 * @param node The tree-sitter identifier node
 * @returns The AST identifier expression node
 */
export function adaptIdentifier(node: TreeSitterNode): IdentifierExpression {
  return {
    type: 'IdentifierExpression',
    name: node.text,
    position: extractPosition(node),
  };
}
