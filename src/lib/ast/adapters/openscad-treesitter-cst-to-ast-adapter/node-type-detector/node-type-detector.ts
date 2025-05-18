import { TreeSitterNode } from '../../../types';

/**
 * Detect the AST node type from a Tree-sitter CST node
 * @param node The Tree-sitter CST node
 * @returns The corresponding AST node type string
 */
export function detectNodeType(node: TreeSitterNode): string {
  switch (node.type) {
    case 'program':
      return 'Program';
    case 'call_expression':
      return 'CallExpression';
    case 'identifier':
      return 'IdentifierExpression';
    case 'number_literal':
    case 'string_literal':
    case 'boolean_literal':
      return 'LiteralExpression';
    case 'assignment':
      return 'AssignmentStatement';
    case 'module_declaration':
      return 'ModuleDeclaration';
    case 'block':
      return 'BlockStatement';
    case 'if_statement':
      return 'IfStatement';
    case 'for_statement':
      return 'ForStatement';
    case 'binary_expression':
      return 'BinaryExpression';
    default:
      return 'Unknown';
  }
}
