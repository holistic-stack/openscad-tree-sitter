/**
 * @file parser-test-utils.js
 * @description Utility functions for testing the OpenSCAD grammar
 * 
 * @context Helper functions used by Vitest tests to test the OpenSCAD grammar
 * @usage Import these functions in test files to test grammar rules
 */

const Parser = require('../../bindings/node');
const TreeSitter = require('tree-sitter');

/**
 * Create a tree-sitter parser instance for OpenSCAD.
 * 
 * @returns {TreeSitter} A configured tree-sitter parser instance
 */
function createParser() {
  const parser = new TreeSitter();
  parser.setLanguage(Parser);
  return parser;
}

/**
 * Parse OpenSCAD code and return the syntax tree.
 * 
 * @param {string} code - The OpenSCAD code to parse
 * @returns {Object} The parsed syntax tree
 */
function parseCode(code) {
  const parser = createParser();
  return parser.parse(code);
}

/**
 * Test if a string of OpenSCAD code is parsed without errors.
 * 
 * @param {string} code - The OpenSCAD code to test
 * @returns {boolean} True if parsing succeeded without errors
 */
function testParse(code) {
  const tree = parseCode(code);
  return !hasErrors(tree.rootNode);
}

/**
 * Check if a syntax tree node contains any ERROR nodes.
 * 
 * @param {Object} node - The syntax tree node to check
 * @returns {boolean} True if the node or any of its children contains an ERROR
 */
function hasErrors(node) {
  if (node.type === 'ERROR') return true;
  
  for (let i = 0; i < node.childCount; i++) {
    if (hasErrors(node.child(i))) return true;
  }
  
  return false;
}

/**
 * Get the node type at a specific position in the syntax tree.
 * 
 * @param {Object} tree - The syntax tree to search
 * @param {Object} position - The position to look for, with row and column properties
 * @returns {string} The node type at the specified position
 */
function getNodeTypeAtPosition(tree, position) {
  const point = {row: position.row, column: position.column};
  const node = tree.rootNode.descendantForPosition(point);
  return node.type;
}

/**
 * Extract all nodes of a specific type from a syntax tree.
 * 
 * @param {Object} tree - The syntax tree to search
 * @param {string} nodeType - The type of nodes to extract
 * @returns {Array} An array of nodes of the specified type
 */
function findNodesOfType(tree, nodeType) {
  const nodes = [];
  
  function traverse(node) {
    if (node.type === nodeType) {
      nodes.push(node);
    }
    
    for (let i = 0; i < node.childCount; i++) {
      traverse(node.child(i));
    }
  }
  
  traverse(tree.rootNode);
  return nodes;
}

module.exports = {
  createParser,
  parseCode,
  testParse,
  hasErrors,
  getNodeTypeAtPosition,
  findNodesOfType
}; 