import { Parser } from 'web-tree-sitter';
import { UnaryExpressionVisitor } from '../../lib/openscad-parser/ast/visitors/unary-expression-visitor';
import { setupParser } from '../../test-utils/parser-setup';

describe('UnaryExpressionVisitor', () => {
  let parser: Parser;
  let visitor: UnaryExpressionVisitor;

  beforeAll(async () => {
    parser = await setupParser();
  });

  beforeEach(() => {
    visitor = new UnaryExpressionVisitor('');
  });

  const parseAndVisit = (code: string) => {
    const tree = parser.parse(code);
    // Ensure we have a valid root node
    if (!tree.rootNode) {
      throw new Error('Failed to parse code');
    }
    return visitor.visit(tree.rootNode);
  };

  describe('Unary operations', () => {
    it('should handle logical NOT', () => {
      const result = parseAndVisit('!true');
      expect(result).toEqual({
        expressionType: 'unary',
        operator: '!',
        operand: { expressionType: 'literal', value: true },
        prefix: true,
      });
    });

    it('should handle numeric negation', () => {
      const result = parseAndVisit('-42');
      expect(result).toEqual({
        expressionType: 'unary',
        operator: '-',
        operand: { expressionType: 'literal', value: 42 },
        prefix: true,
      });
    });

    it('should handle unary plus', () => {
      const result = parseAndVisit('+42');
      expect(result).toEqual({
        expressionType: 'unary',
        operator: '+',
        operand: { expressionType: 'literal', value: 42 },
        prefix: true,
      });
    });
  });

  describe('Nested expressions', () => {
    it('should handle nested unary expressions', () => {
      const result = parseAndVisit('!!true');
      expect(result).toEqual({
        expressionType: 'unary',
        operator: '!',
        operand: {
          expressionType: 'unary',
          operator: '!',
          operand: { expressionType: 'literal', value: true },
          prefix: true,
        },
        prefix: true,
      });
    });

    it('should handle unary expressions with binary expressions', () => {
      const result = parseAndVisit('-(2 + 3)');
      expect(result).toEqual({
        expressionType: 'unary',
        operator: '-',
        operand: {
          expressionType: 'binary',
          operator: '+',
          left: { expressionType: 'literal', value: 2 },
          right: { expressionType: 'literal', value: 3 },
        },
        prefix: true,
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple unary operators', () => {
      const result = parseAndVisit('---1');
      expect(result).toEqual({
        expressionType: 'unary',
        operator: '-',
        operand: {
          expressionType: 'unary',
          operator: '-',
          operand: {
            expressionType: 'unary',
            operator: '-',
            operand: { expressionType: 'literal', value: 1 },
            prefix: true,
          },
          prefix: true,
        },
        prefix: true,
      });
    });

    it('should handle unary operators with variables', () => {
      const result = parseAndVisit('-x');
      expect(result).toEqual({
        expressionType: 'unary',
        operator: '-',
        operand: { expressionType: 'variable', name: 'x' },
        prefix: true,
      });
    });
  });
});
