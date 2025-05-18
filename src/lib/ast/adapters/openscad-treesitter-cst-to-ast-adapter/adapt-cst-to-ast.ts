import { TreeSitterNode, ASTNode } from '../../types';
import { detectNodeType, extractPosition } from './utils';
import { adaptProgram, adaptCallExpression, adaptIdentifier, adaptLiteral, adaptAssignment } from './node-adapters';
import { createNodeAdapter, NodeAdapterMap } from './adapter-factory/adapter-factory';

/**
 * Map of AST node types to their adapter functions
 */
const adapterMap: NodeAdapterMap = {
  'Program': adaptProgram,
  'CallExpression': adaptCallExpression,
  'IdentifierExpression': adaptIdentifier,
  'LiteralExpression': adaptLiteral,
  'AssignmentStatement': adaptAssignment,
};

/**
 * Converts a tree-sitter CST node to an AST node
 * Main entry point for the CST to AST conversion
 * 
 * @param node The tree-sitter CST node
 * @returns The converted AST node
 */
export function adaptCstToAst(node: TreeSitterNode): ASTNode {
  // Create the node adapter using our factory
  const adaptNode = createNodeAdapter(adapterMap);
  
  // Convert the root node and its children recursively
  return adaptNode(node);
}
