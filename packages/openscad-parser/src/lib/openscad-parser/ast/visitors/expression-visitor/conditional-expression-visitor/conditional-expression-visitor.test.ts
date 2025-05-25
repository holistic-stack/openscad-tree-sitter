import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Node as TSNode } from 'web-tree-sitter';

import { ConditionalExpressionVisitor } from './conditional-expression-visitor';
import { ExpressionVisitor } from '../../expression-visitor';
import { ErrorHandler } from '../../../../error-handling';
import { OpenscadParser } from '../../../../openscad-parser';

async function getExpressionNode(parser: OpenscadParser, code: string): Promise<TSNode | null> {
  const tree = parser.parse(code);
  if (!tree) return null;

  let conditionalExprNode: TSNode | null = null;
  function findNode(node: TSNode) {
    if (node.type === 'conditional_expression') {
      conditionalExprNode = node;
      return;
    }
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        findNode(child);
        if (conditionalExprNode) return;
      }
    }
  }
  findNode(tree.rootNode);
  return conditionalExprNode;
}

describe('ConditionalExpressionVisitor', () => {
  let parser: OpenscadParser;
  let errorHandler: ErrorHandler;
  let parentExpressionVisitor: ExpressionVisitor;
  let visitor: ConditionalExpressionVisitor;

  beforeEach(async () => {
    // Create a new parser instance before each test
    parser = new OpenscadParser();

    // Initialize the parser
    await parser.init();

    errorHandler = new ErrorHandler();
    parentExpressionVisitor = new ExpressionVisitor('dummy source', errorHandler);
    visitor = new ConditionalExpressionVisitor(parentExpressionVisitor, errorHandler);
  });

  afterEach(() => {
    // Clean up after each test
    parser.dispose();
  });

  it('should parse a simple conditional expression', async () => {
    const code = 'x = a > b ? 10 : 20;'; // Example: a > b ? 10 : 20
    const tsNode = await getExpressionNode(parser, code);
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
      thenBranch: {
        type: 'expression',
        expressionType: 'literal',
        literalType: 'number',
        value: 10,
        location: expect.anything(),
      },
      elseBranch: {
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
