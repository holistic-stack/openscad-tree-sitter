import { describe, it, expect, beforeEach } from 'vitest';
import { Parser, Node as TSNode } from 'web-tree-sitter';
import * as path from 'path';

import { ParenthesizedExpressionVisitor } from './parenthesized-expression-visitor';
import { ExpressionVisitor } from '../expression-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { OpenSCADParser } from '../../../../openscad-parser';

let parser: Parser;
let openSCADParser: OpenSCADParser;

async function getExpressionNode(code: string): Promise<TSNode | null> {
  const tree = await openSCADParser.parse(code);
  let parenExprNode: TSNode | null = null;
  function findNode(node: TSNode) {
    if (node.type === 'parenthesized_expression') {
      parenExprNode = node;
      return;
    }
    for (const child of node.children) {
      findNode(child);
      if (parenExprNode) return;
    }
  }
  if (tree.rootNode) {
    findNode(tree.rootNode);
  }
  return parenExprNode;
}

describe('ParenthesizedExpressionVisitor', () => {
  let errorHandler: ErrorHandler;
  let parentExpressionVisitor: ExpressionVisitor;
  let visitor: ParenthesizedExpressionVisitor;

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
      openSCADParser = new OpenSCADParser();
      await openSCADParser.init();
    }

    errorHandler = new ErrorHandler();
    parentExpressionVisitor = new ExpressionVisitor('dummy source', errorHandler);
    visitor = new ParenthesizedExpressionVisitor(parentExpressionVisitor, errorHandler);
  });

  it('should parse a simple parenthesized expression (number literal)', async () => {
    const code = 'x = (123);';
    const tsNode = await getExpressionNode(code);
    expect(tsNode).not.toBeNull();
    if (!tsNode) return;

    const astNode = visitor.visit(tsNode);

    // Expect the inner expression's AST node
    expect(astNode).toEqual({
      type: 'expression',
      expressionType: 'literal',
      literalType: 'number',
      value: 123,
      location: expect.anything(), // Location should ideally be of the inner expression
    });
    expect(errorHandler.getErrors()).toHaveLength(0);
  });

  it('should parse a parenthesized binary expression', async () => {
    const code = 'x = (a + b);';
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
        expressionType: 'variable_reference',
        name: 'a',
        location: expect.anything(),
      },
      right: {
        type: 'expression',
        expressionType: 'variable_reference',
        name: 'b',
        location: expect.anything(),
      },
      location: expect.anything(), // Location should ideally be of the inner binary expression
    });
    expect(errorHandler.getErrors()).toHaveLength(0);
  });
});
