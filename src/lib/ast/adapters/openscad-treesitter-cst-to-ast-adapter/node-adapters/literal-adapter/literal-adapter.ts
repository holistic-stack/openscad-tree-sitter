import { TreeSitterNode, LiteralExpression } from '../../../../types';
import { extractPosition } from '../../utils';

/**
 * Adapts a tree-sitter literal node to an AST literal expression node
 * 
 * @param node The tree-sitter literal node (number, string, or boolean)
 * @returns The AST literal expression node
 */
export function adaptLiteral(node: TreeSitterNode): LiteralExpression {
  switch (node.type) {
    case 'number_literal':
      return {
        type: 'LiteralExpression',
        valueType: 'number',
        value: parseFloat(node.text),
        position: extractPosition(node),
      };
      
    case 'string_literal': {
      // Remove quotes from string literals
      const text = node.text;
      const unquoted = text.startsWith('"') && text.endsWith('"')
        ? text.slice(1, -1)
        : text.startsWith("'") && text.endsWith("'")
          ? text.slice(1, -1)
          : text;
          
      return {
        type: 'LiteralExpression',
        valueType: 'string',
        value: unquoted,
        position: extractPosition(node),
      };
    }
      
    case 'boolean_literal':
      return {
        type: 'LiteralExpression',
        valueType: 'boolean',
        value: node.text === 'true',
        position: extractPosition(node),
      };
      
    default:
      // Default to number zero for unrecognized literals
      return {
        type: 'LiteralExpression',
        valueType: 'number',
        value: 0,
        position: extractPosition(node),
      };
  }
}
