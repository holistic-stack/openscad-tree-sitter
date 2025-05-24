import { Parser } from 'web-tree-sitter';
import { BinaryExpressionVisitor } from '../../lib/openscad-parser/ast/visitors/binary-expression-visitor';
import { setupParser } from '../../test-utils/parser-setup';

describe('BinaryExpressionVisitor', () => {
  let parser: Parser;
  let visitor: BinaryExpressionVisitor;

  beforeAll(async () => {
    parser = await setupParser();
  });

  beforeEach(() => {
    visitor = new BinaryExpressionVisitor('');
  });

  const parseAndVisit = (code: string) => {
    const tree = parser.parse(code);
    // Ensure we have a valid root node
    if (!tree.rootNode) {
      throw new Error('Failed to parse code');
    }
    return visitor.visit(tree.rootNode);
  };

  describe('Arithmetic operations', () => {
    it('should handle addition', () => {
      const result = parseAndVisit('1 + 2');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '+',
        left: { expressionType: 'literal', value: 1 },
        right: { expressionType: 'literal', value: 2 },
      });
    });

    it('should handle subtraction', () => {
      const result = parseAndVisit('5 - 3');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '-',
        left: { expressionType: 'literal', value: 5 },
        right: { expressionType: 'literal', value: 3 },
      });
    });

    it('should handle multiplication', () => {
      const result = parseAndVisit('2 * 3');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '*',
        left: { expressionType: 'literal', value: 2 },
        right: { expressionType: 'literal', value: 3 },
      });
    });

    it('should handle division', () => {
      const result = parseAndVisit('6 / 2');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '/',
        left: { expressionType: 'literal', value: 6 },
        right: { expressionType: 'literal', value: 2 },
      });
    });

    it('should handle modulo', () => {
      const result = parseAndVisit('5 % 2');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '%',
        left: { expressionType: 'literal', value: 5 },
        right: { expressionType: 'literal', value: 2 },
      });
    });

    it('should handle exponentiation', () => {
      const result = parseAndVisit('2 ^ 3');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '^',
        left: { expressionType: 'literal', value: 2 },
        right: { expressionType: 'literal', value: 3 },
      });
    });
  });

  describe('Comparison operations', () => {
    it('should handle equality', () => {
      const result = parseAndVisit('a == b');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '==',
        left: { expressionType: 'variable', name: 'a' },
        right: { expressionType: 'variable', name: 'b' },
      });
    });

    it('should handle inequality', () => {
      const result = parseAndVisit('a != b');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '!=',
        left: { expressionType: 'variable', name: 'a' },
        right: { expressionType: 'variable', name: 'b' },
      });
    });

    it('should handle less than', () => {
      const result = parseAndVisit('a < b');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '<',
        left: { expressionType: 'variable', name: 'a' },
        right: { expressionType: 'variable', name: 'b' },
      });
    });

    it('should handle less than or equal', () => {
      const result = parseAndVisit('a <= b');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '<=',
        left: { expressionType: 'variable', name: 'a' },
        right: { expressionType: 'variable', name: 'b' },
      });
    });

    it('should handle greater than', () => {
      const result = parseAndVisit('a > b');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '>',
        left: { expressionType: 'variable', name: 'a' },
        right: { expressionType: 'variable', name: 'b' },
      });
    });

    it('should handle greater than or equal', () => {
      const result = parseAndVisit('a >= b');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '>=',
        left: { expressionType: 'variable', name: 'a' },
        right: { expressionType: 'variable', name: 'b' },
      });
    });
  });

  describe('Logical operations', () => {
    it('should handle logical AND', () => {
      const result = parseAndVisit('a && b');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '&&',
        left: { expressionType: 'variable', name: 'a' },
        right: { expressionType: 'variable', name: 'b' },
      });
    });

    it('should handle logical OR', () => {
      const result = parseAndVisit('a || b');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '||',
        left: { expressionType: 'variable', name: 'a' },
        right: { expressionType: 'variable', name: 'b' },
      });
    });
  });

  describe('Operator precedence', () => {
    it('should respect multiplication precedence over addition', () => {
      const result = parseAndVisit('1 + 2 * 3');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '+',
        left: { expressionType: 'literal', value: 1 },
        right: {
          expressionType: 'binary',
          operator: '*',
          left: { expressionType: 'literal', value: 2 },
          right: { expressionType: 'literal', value: 3 },
        },
      });
    });

    it('should respect parentheses for grouping', () => {
      const result = parseAndVisit('(1 + 2) * 3');
      expect(result).toEqual({
        expressionType: 'binary',
        operator: '*',
        left: {
          expressionType: 'binary',
          operator: '+',
          left: { expressionType: 'literal', value: 1 },
          right: { expressionType: 'literal', value: 2 },
        },
        right: { expressionType: 'literal', value: 3 },
      });
    });
  });
});
