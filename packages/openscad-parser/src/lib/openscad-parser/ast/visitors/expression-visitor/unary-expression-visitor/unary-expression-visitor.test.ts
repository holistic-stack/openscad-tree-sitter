import { describe, it, expect, beforeEach } from 'vitest';
import { Parser, Node as TSNode } from 'web-tree-sitter';
import * as path from 'path';

import { UnaryExpressionVisitor } from './unary-expression-visitor';
import { ExpressionVisitor } from '../expression-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { OpenSCADParser } from '../../../../openscad-parser';

let parser: Parser;
let openSCADParser: OpenSCADParser;

async function getExpressionNode(code: string): Promise<TSNode | null> {
  const tree = await openSCADParser.parse(code);
  let unaryExprNode: TSNode | null = null;
  function findNode(node: TSNode) {
    if (node.type === 'unary_expression') {
      unaryExprNode = node;
      return;
    }
    for (const child of node.children) {
      findNode(child);
      if (unaryExprNode) return;
    }
  }
  if (tree.rootNode) {
    findNode(tree.rootNode);
  }
  return unaryExprNode;
}

describe('UnaryExpressionVisitor', () => {
  let errorHandler: ErrorHandler;
  let parentExpressionVisitor: ExpressionVisitor;
  let visitor: UnaryExpressionVisitor;

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
    visitor = new UnaryExpressionVisitor(parentExpressionVisitor, errorHandler);
  });

  it('should parse a simple negation expression', async () => {
    const code = 'x = -y;'; // Example: -y
    const tsNode = await getExpressionNode(code);
    expect(tsNode).not.toBeNull();
    if (!tsNode) return;

    const astNode = visitor.visit(tsNode);

    expect(astNode).toEqual({
      type: 'expression',
      expressionType: 'unary_expression',
      operator: '-',
      operand: {
        type: 'expression',
        expressionType: 'variable_reference',
        name: 'y',
        location: expect.anything(),
      },
      location: expect.anything(),
    });
    expect(errorHandler.getErrors()).toHaveLength(0);
  });

  it('should parse a simple logical not expression', async () => {
    const code = 'x = !z;'; // Example: !z
    const tsNode = await getExpressionNode(code);
    expect(tsNode).not.toBeNull();
    if (!tsNode) return;

    const astNode = visitor.visit(tsNode);

    expect(astNode).toEqual({
      type: 'expression',
      expressionType: 'unary_expression',
      operator: '!',
      operand: {
        type: 'expression',
        expressionType: 'variable_reference',
        name: 'z',
        location: expect.anything(),
      },
      location: expect.anything(),
    });
    expect(errorHandler.getErrors()).toHaveLength(0);
  });
});
