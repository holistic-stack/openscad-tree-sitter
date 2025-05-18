import { TreeSitterNode, ASTPosition } from '../../../types';

/**
 * Extracts position information from a Tree-sitter CST node
 * and converts it to the AST position format
 * 
 * @param node The Tree-sitter CST node
 * @returns The AST position
 */
export function extractPosition(node: TreeSitterNode): ASTPosition {
  return {
    startLine: node.startPosition.row,
    startColumn: node.startPosition.column,
    endLine: node.endPosition.row,
    endColumn: node.endPosition.column,
  };
}
