import { describe, it, expect, beforeEach } from 'vitest';
import { Parser, Node as TSNode } from 'web-tree-sitter';
import * as path from 'path';
import { promises as fs } from 'fs';

import { BinaryExpressionVisitor } from './binary-expression-visitor';
import { ExpressionVisitor } from '../expression-visitor'; // Adjust path as needed
import { ErrorHandler } from '../../../../error-handling'; // Adjust path as needed
import { OpenSCADParser } from '../../../../openscad-parser'; // For getting a Tree-sitter node

let parser: Parser;
let openSCADParser: OpenSCADParser;

// Helper function to get a Tree-sitter node for an expression
async function getExpressionNode(code: string): Promise<TSNode | null> {
  const tree = await openSCADParser.parse(code);
  // Assuming the expression is the first statement's child,
  // or a more robust way to find the specific expression node.
  // For "a + b;", it might be tree.rootNode.child(0)?.child(0)?.child(0)
  // This needs to be adapted based on actual grammar structure for expressions.
  // For now, let's assume a simple top-level expression for testing.
  // A robust approach would be to find the 'binary_expression' node.
  let binaryExprNode: TSNode | null = null;
  function findNode(node: TSNode) {
    if (node.type === 'binary_expression') {
      binaryExprNode = node;
      return;
    }
    for (const child of node.children) {
      findNode(child);
      if (binaryExprNode) return;
    }
  }
  if (tree.rootNode) {
    findNode(tree.rootNode);
  }
  return binaryExprNode;
}


describe('BinaryExpressionVisitor', () => {
  let errorHandler: ErrorHandler;
  let parentExpressionVisitor: ExpressionVisitor;
  let visitor: BinaryExpressionVisitor;

  beforeEach(async () => {
    if (!parser) {
      await Parser.init();
      parser = new Parser();
      const languagePath = path.join(
        __dirname,
        '../../../../../../tree-sitter-openscad/tree-sitter-openscad.wasm'
      );
      const OpenSCAD = await Parser.Language.load(languagePath);
      parser.setLanguage(OpenSCAD);
    }
    if (!openSCADParser) {
      openSCADParser = new OpenSCADParser(); // Initialize your main parser
      await openSCADParser.init();
    }

    errorHandler = new ErrorHandler();
    // Mock parentVisitor or use a real one if simple enough
    parentExpressionVisitor = new ExpressionVisitor('dummy source', errorHandler);
    visitor = new BinaryExpressionVisitor(parentExpressionVisitor, errorHandler);
  });

  it('should parse a simple addition expression', async () => {
    const code = 'x = 1 + 2;';
    const tsNode = await getExpressionNode(code);
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
