import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Node as TSNode } from 'web-tree-sitter';

import { BinaryExpressionVisitor } from './binary-expression-visitor';
import { ExpressionVisitor } from '../../expression-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { OpenscadParser } from '../../../../openscad-parser';

// Helper function to get a Tree-sitter node for an expression
function getExpressionNode(parser: OpenscadParser, code: string): TSNode | null {
  const tree = parser.parse(code);
  if (!tree) return null;

  // Debug: Print the entire tree structure
  console.log('Tree structure for code:', code);
  console.log('Root node:', tree.rootNode.toString());

  function printTree(node: TSNode, depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${node.type}: "${node.text}"`);
    for (const child of node.children) {
      if (child) {
        printTree(child, depth + 1);
      }
    }
  }

  printTree(tree.rootNode);

  // Find any expression-related node in the tree (not just binary_expression)
  let exprNode: TSNode | null = null;
  function findNode(node: TSNode) {
    // Look for various expression types that might contain binary expressions
    if (node.type.includes('expression') || node.type === 'additive_expression' ||
        node.type === 'multiplicative_expression' || node.type === 'binary_expression') {
      console.log(`Found expression node: ${node.type} with text: "${node.text}"`);
      exprNode = node;
      return;
    }
    for (const child of node.children) {
      if (child) {
        findNode(child);
        if (exprNode) return;
      }
    }
  }

  if (tree.rootNode) {
    findNode(tree.rootNode);
  }
  return exprNode;
}


describe('BinaryExpressionVisitor', () => {
  let parser: OpenscadParser;
  let errorHandler: ErrorHandler;
  let parentExpressionVisitor: ExpressionVisitor;
  let visitor: BinaryExpressionVisitor;

  beforeEach(async () => {
    // Create a new parser instance before each test
    parser = new OpenscadParser();

    // Initialize the parser
    await parser.init();

    errorHandler = new ErrorHandler();
    // Use a real ExpressionVisitor instance
    parentExpressionVisitor = new ExpressionVisitor('dummy source', errorHandler);
    visitor = new BinaryExpressionVisitor(parentExpressionVisitor, errorHandler);
  });

  afterEach(() => {
    // Clean up after each test
    parser.dispose();
  });

  it('should parse a simple addition expression', () => {
    const code = 'x = 1 + 2;';
    const tsNode = getExpressionNode(parser, code);
    expect(tsNode).not.toBeNull();
    if (!tsNode) return;

    console.log('Found node type:', tsNode.type);
    console.log('Node text:', tsNode.text);

    const astNode = visitor.visit(tsNode);

    expect(astNode).toEqual({
      type: 'expression',
      expressionType: 'binary',
      operator: '+',
      left: {
        type: 'expression',
        expressionType: 'literal',
        value: 1, // Corrected: 1 is a number literal
        location: expect.anything(),
      },
      right: {
        type: 'expression',
        expressionType: 'literal',
        value: 2,
        location: expect.anything(),
      },
      location: expect.anything(),
    });
    expect(errorHandler.getErrors()).toHaveLength(0);
  });

  // Add more tests for different operators, precedences, data types, etc.
  // e.g., subtraction, multiplication, division, logical operators, comparisons
  // e.g., "a * b + c" (precedence)
  // e.g., "true && false"
});
