import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Node as TSNode } from 'web-tree-sitter';

import { BinaryExpressionVisitor } from './binary-expression-visitor';
import { ExpressionVisitor } from '../expression-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { OpenscadParser } from '../../../../openscad-parser';

// Helper function to get a Tree-sitter node for an expression
function getExpressionNode(parser: OpenscadParser, code: string): TSNode | null {
  const tree = parser.parse(code);
  if (!tree) return null;

  // Find the 'binary_expression' node in the tree
  let binaryExprNode: TSNode | null = null;
  function findNode(node: TSNode) {
    if (node.type === 'binary_expression') {
      binaryExprNode = node;
      return;
    }
    for (const child of node.children) {
      if (child) {
        findNode(child);
        if (binaryExprNode) return;
      }
    }
  }

  if (tree.rootNode) {
    findNode(tree.rootNode);
  }
  return binaryExprNode;
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

    const astNode = visitor.visit(tsNode);

    expect(astNode).toEqual({
      type: 'expression',
      expressionType: 'binary_expression',
      operator: '+',
      left: {
        type: 'expression',
        expressionType: 'literal',
        literalType: 'number',
        value: 1, // Corrected: 1 is a number literal
        location: expect.anything(),
      },
      right: {
        type: 'expression',
        expressionType: 'literal',
        literalType: 'number',
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
