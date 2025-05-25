import { describe, it, expect, beforeEach } from 'vitest';
import { Parser, Node as TSNode } from 'web-tree-sitter';
import * as path from 'path';

import { ConditionalExpressionVisitor } from './conditional-expression-visitor';
import { ExpressionVisitor } from '../expression-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { OpenSCADParser } from '../../../../openscad-parser';

let parser: Parser;
let openSCADParser: OpenSCADParser;

async function getExpressionNode(code: string): Promise<TSNode | null> {
  const tree = await openSCADParser.parse(code);
  let conditionalExprNode: TSNode | null = null;
  function findNode(node: TSNode) {
    if (node.type === 'conditional_expression') {
      conditionalExprNode = node;
      return;
    }
    for (const child of node.children) {
      findNode(child);
      if (conditionalExprNode) return;
    }
  }
  if (tree.rootNode) {
    findNode(tree.rootNode);
  }
  return conditionalExprNode;
}

describe('ConditionalExpressionVisitor', () => {
  let errorHandler: ErrorHandler;
  let parentExpressionVisitor: ExpressionVisitor;
  let visitor: ConditionalExpressionVisitor;

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
    visitor = new ConditionalExpressionVisitor(parentExpressionVisitor, errorHandler);
  });

  it('should parse a simple conditional expression', async () => {
    const code = 'x = a > b ? 10 : 20;'; // Example: a > b ? 10 : 20
    const tsNode = await getExpressionNode(code);
    expect(tsNode).not.toBeNull();
    if (!tsNode) return;

    const astNode = visitor.visit(tsNode);

    expect(astNode).toEqual({
      type: 'expression',
      expressionType: 'conditional_expression',
      condition: {
        type: 'expression',
        expressionType: 'binary_expression', // Assuming a > b is a binary expression
        operator: '>',
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
        location: expect.anything(),
      },
      consequence: {
        type: 'expression',
        expressionType: 'literal',
        literalType: 'number',
        value: 10,
        location: expect.anything(),
      },
      alternative: {
        type: 'expression',
        expressionType: 'literal',
        literalType: 'number',
        value: 20,
        location: expect.anything(),
      },
      location: expect.anything(),
    });
    expect(errorHandler.getErrors()).toHaveLength(0);
  });
});
