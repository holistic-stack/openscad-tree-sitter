/**
 * @file parser-test-utils.ts
 * @description Utility functions for testing the OpenSCAD grammar
 * 
 * @context Helper functions used by Vitest tests to test the OpenSCAD grammar
 * @usage Import these functions in test files to test grammar rules
 */

import Parser from '../../bindings/node';
import TreeSitter from 'tree-sitter';
import { SyntaxNode, Tree, Point } from '../types';

/**
 * Create a tree-sitter parser instance for OpenSCAD.
 * 
 * @returns A configured tree-sitter parser instance
 */
export function createParser(): TreeSitter {
  const parser = new TreeSitter();
  parser.setLanguage(Parser);
  return parser;
}

/**
 * Parse OpenSCAD code and return the syntax tree.
 * 
 * @param code - The OpenSCAD code to parse
 * @returns The parsed syntax tree
 */
export function parseCode(code: string): Tree {
  const parser = createParser();
  return parser.parse(code);
}

/**
 * Test if a string of OpenSCAD code is parsed without errors.
 * 
 * @param code - The OpenSCAD code to test
 * @returns True if parsing succeeded without errors
 */
export function testParse(code: string): boolean {
  const tree = parseCode(code);
  return !hasErrors(tree.rootNode);
}

/**
 * Check if a syntax tree node contains any ERROR nodes.
 * 
 * @param node - The syntax tree node to check
 * @returns True if the node or any of its children contains an ERROR
 */
export function hasErrors(node: SyntaxNode): boolean {
  if (node.type === 'ERROR') return true;
  
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child && hasErrors(child)) return true;
  }
  
  return false;
}

/**
 * Get the node type at a specific position in the syntax tree.
 * 
 * @param tree - The syntax tree to search
 * @param position - The position to look for, with row and column properties
 * @returns The node type at the specified position
 */
export function getNodeTypeAtPosition(tree: Tree, position: Point): string {
  const point = { row: position.row, column: position.column };
  const node = tree.rootNode.descendantForPosition(point);
  return node ? node.type : '';
}

/**
 * Extract all nodes of a specific type from a syntax tree.
 * 
 * @param tree - The syntax tree to search
 * @param nodeType - The type of nodes to extract
 * @returns An array of nodes of the specified type
 */
export function findNodesOfType(tree: Tree, nodeType: string): SyntaxNode[] {
  const nodes: SyntaxNode[] = [];
  
  function traverse(node: SyntaxNode): void {
    if (node.type === nodeType) {
      nodes.push(node);
    }
    
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) traverse(child);
    }
  }
  
  traverse(tree.rootNode);
  return nodes;
} 