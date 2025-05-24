import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OpenscadParser } from '../../openscad-parser';
import { BinaryExpression } from '../nodes/expressions/binary-expression';
import { setupParser } from '../../../test-utils/parser-setup';
import { Parser } from 'web-tree-sitter';
import { VisitorASTGenerator } from '../visitor-ast-generator';
import { NodeLocation } from '../../../node-location';

describe('BinaryExpressionVisitor', () => {
  let parser: OpenscadParser;

  beforeEach(async () => {
    parser = new OpenscadParser();
    await parser.init();
  });

  afterEach(() => {
    parser.dispose();
  });

  const parseExpression = async (code: string): Promise<BinaryExpression> => {
    const source = `x = ${code};`;
    const tree = await parser.parse(source);
    const generator = new VisitorASTGenerator(tree, source);
    const ast = generator.generate();
    
    // The AST should have a root node with one child (the assignment)
    const assignment = ast.rootNode?.children?.[0];
    if (!assignment || assignment.type !== 'assignment') {
      throw new Error(`Expected assignment, got ${assignment?.type}`);
    }
    
    // The value should be a binary expression
    const value = assignment.value;
    if (!(value instanceof BinaryExpression)) {
      throw new Error(`Expected BinaryExpression, got ${value?.constructor.name}`);
    }
    
    return value;
  };
  
  const expectBinaryExpression = (
    expr: BinaryExpression,
    operator: string,
    leftType?: string,
    rightType?: string
  ) => {
    expect(expr).toBeInstanceOf(BinaryExpression);
    expect(expr.operator).toBe(operator);
    
    if (leftType) {
      expect(expr.left.type).toBe(leftType);
    }
    
    if (rightType) {
      expect(expr.right.type).toBe(rightType);
    }
    
    // Verify location information is set
    expect(expr.location).toBeDefined();
    expect(expr.location.startPosition).toBeDefined();
    expect(expr.location.endPosition).toBeDefined();
  }; 
  
  const expectNumericLiteral = (expr: any, value: number) => {
    expect(expr.type).toBe('number');
    expect(expr.value).toBe(value);
  };
  
  const expectIdentifier = (expr: any, name: string) => {
    expect(expr.type).toBe('identifier');
    expect(expr.name).toBe(name);
  };

  describe('Arithmetic Operators', () => {
    it('should parse simple addition', async () => {
      const expr = await parseExpression('1 + 2');
      expectBinaryExpression(expr, '+', 'number', 'number');
      expectNumericLiteral(expr.left, 1);
      expectNumericLiteral(expr.right, 2);
    });
    
    it('should parse addition with variables', async () => {
      const expr = await parseExpression('a + b');
      expectBinaryExpression(expr, '+', 'identifier', 'identifier');
      expectIdentifier(expr.left, 'a');
      expectIdentifier(expr.right, 'b');
    });
    
    it('should parse addition with function calls', async () => {
      const expr = await parseExpression('sin(a) + cos(b)');
      expectBinaryExpression(expr, '+', 'call_expression', 'call_expression');
      expect(expr.left.callee.name).toBe('sin');
      expect(expr.right.callee.name).toBe('cos');
    });

    it('should parse simple subtraction', async () => {
      const expr = await parseExpression('5 - 3');
      expect(expr).toBeInstanceOf(BinaryExpression);
      expect(expr.operator).toBe('-');
      expect(expr.left).toBeDefined();
      expect(expr.right).toBeDefined();
    });

    it('should parse multiplication', async () => {
      const expr = await parseExpression('4 * 6');
      expect(expr).toBeInstanceOf(BinaryExpression);
      expect(expr.operator).toBe('*');
      expect(expr.left).toBeDefined();
      expect(expr.right).toBeDefined();
    });

    it('should parse division', async () => {
      const expr = await parseExpression('10 / 2');
      expect(expr).toBeInstanceOf(BinaryExpression);
      expect(expr.operator).toBe('/');
      expect(expr.left).toBeDefined();
      expect(expr.right).toBeDefined();
    });

    it('should parse modulo', async () => {
      const expr = await parseExpression('10 % 3');
      expect(expr).toBeInstanceOf(BinaryExpression);
      expect(expr.operator).toBe('%');
      expect(expr.left).toBeDefined();
      expect(expr.right).toBeDefined();
    });
  });

  describe('Comparison Operators', () => {
    it('should parse equality comparison', async () => {
      const expr = await parseExpression('a == b');
      expect(expr).toBeInstanceOf(BinaryExpression);
      expect(expr.operator).toBe('==');
    });

    it('should parse inequality comparison', async () => {
      const expr = await parseExpression('a != b');
      expect(expr).toBeInstanceOf(BinaryExpression);
      expect(expr.operator).toBe('!=');
    });

    it('should parse less than', async () => {
      const expr = await parseExpression('a < b');
      expect(expr).toBeInstanceOf(BinaryExpression);
      expect(expr.operator).toBe('<');
    });

    it('should parse less than or equal', async () => {
      const expr = await parseExpression('a <= b');
      expect(expr).toBeInstanceOf(BinaryExpression);
      expect(expr.operator).toBe('<=');
    });

    it('should parse greater than', async () => {
      const expr = await parseExpression('a > b');
      expect(expr).toBeInstanceOf(BinaryExpression);
      expect(expr.operator).toBe('>');
    });

    it('should parse greater than or equal', async () => {
      const expr = await parseExpression('a >= b');
      expect(expr).toBeInstanceOf(BinaryExpression);
      expect(expr.operator).toBe('>=');
    });
  });

  describe('Logical Operators', () => {
    it('should parse logical AND', async () => {
      const expr = await parseExpression('a && b');
      expect(expr).toBeInstanceOf(BinaryExpression);
      expect(expr.operator).toBe('&&');
    });

    it('should parse logical OR', async () => {
      const expr = await parseExpression('a || b');
      expect(expr).toBeInstanceOf(BinaryExpression);
      expect(expr.operator).toBe('||');
    });
  });

  describe('Operator Precedence', () => {
    it('should respect multiplication precedence over addition', async () => {
      const expr = await parseExpression('1 + 2 * 3');
      expectBinaryExpression(expr, '+', 'number');
      expectNumericLiteral(expr.left, 1);
      
      // Right side should be the multiplication
      expect(expr.right).toBeInstanceOf(BinaryExpression);
      expect(expr.right.operator).toBe('*');
      expectNumericLiteral(expr.right.left, 2);
      expectNumericLiteral(expr.right.right, 3);
    });
    
    it('should respect division precedence over subtraction', async () => {
      const expr = await parseExpression('10 - 6 / 2');
      expectBinaryExpression(expr, '-', 'number');
      expectNumericLiteral(expr.left, 10);
      
      // Right side should be the division
      expect(expr.right).toBeInstanceOf(BinaryExpression);
      expect(expr.right.operator).toBe('/');
      expectNumericLiteral(expr.right.left, 6);
      expectNumericLiteral(expr.right.right, 2);
    });
    
    it('should respect comparison precedence over logical AND', async () => {
      const expr = await parseExpression('a > 0 && b < 10');
      expectBinaryExpression(expr, '&&');
      
      // Left side: a > 0
      expect(expr.left).toBeInstanceOf(BinaryExpression);
      expect(expr.left.operator).toBe('>');
      expectIdentifier(expr.left.left, 'a');
      expectNumericLiteral(expr.left.right, 0);
      
      // Right side: b < 10
      expect(expr.right).toBeInstanceOf(BinaryExpression);
      expect(expr.right.operator).toBe('<');
      expectIdentifier(expr.right.left, 'b');
      expectNumericLiteral(expr.right.right, 10);
    });

    it('should respect parentheses for grouping', async () => {
      const expr = await parseExpression('(1 + 2) * 3');
      expectBinaryExpression(expr, '*', undefined, 'number');
      expectNumericLiteral(expr.right, 3);
      
      // Left side should be the addition in parentheses
      expect(expr.left).toBeInstanceOf(BinaryExpression);
      expect(expr.left.operator).toBe('+');
      expectNumericLiteral(expr.left.left, 1);
      expectNumericLiteral(expr.left.right, 2);
    });
    
    it('should handle nested parentheses', async () => {
      const expr = await parseExpression('((1 + 2) * (3 - 4)) / 5');
      expectBinaryExpression(expr, '/', undefined, 'number');
      expectNumericLiteral(expr.right, 5);
      
      // Left side: (1 + 2) * (3 - 4)
      expect(expr.left).toBeInstanceOf(BinaryExpression);
      expect(expr.left.operator).toBe('*');
      
      // Left of *: (1 + 2)
      expect(expr.left.left).toBeInstanceOf(BinaryExpression);
      expect(expr.left.left.operator).toBe('+');
      expectNumericLiteral(expr.left.left.left, 1);
      expectNumericLiteral(expr.left.left.right, 2);
      
      // Right of *: (3 - 4)
      expect(expr.left.right).toBeInstanceOf(BinaryExpression);
      expect(expr.left.right.operator).toBe('-');
      expectNumericLiteral(expr.left.right.left, 3);
      expectNumericLiteral(expr.left.right.right, 4);
    });

    it('should handle mixed operators with correct precedence', async () => {
      const expr = await parseExpression('1 + 2 * 3 - 4 / 2');
      // Expected structure: ((1 + (2 * 3)) - (4 / 2))
      expect(expr.operator).toBe('-');
      expect(expr.left).toBeInstanceOf(BinaryExpression);
      expect(expr.left.operator).toBe('+');
      expect(expr.right).toBeInstanceOf(BinaryExpression);
      expect(expr.right.operator).toBe('/');
    });
  });

  describe('Associativity', () => {
    it('should be left-associative for addition', async () => {
      const expr = await parseExpression('1 + 2 + 3');
      // Expected structure: ((1 + 2) + 3)
      expectBinaryExpression(expr, '+', undefined, 'number');
      expectNumericLiteral(expr.right, 3);
      
      // Left side should be 1 + 2
      expect(expr.left).toBeInstanceOf(BinaryExpression);
      expect(expr.left.operator).toBe('+');
      expectNumericLiteral(expr.left.left, 1);
      expectNumericLiteral(expr.left.right, 2);
    });
    
    it('should be left-associative for subtraction', async () => {
      const expr = await parseExpression('10 - 5 - 1');
      // Expected structure: ((10 - 5) - 1)
      expectBinaryExpression(expr, '-', undefined, 'number');
      expectNumericLiteral(expr.right, 1);
      
      // Left side should be 10 - 5
      expect(expr.left).toBeInstanceOf(BinaryExpression);
      expect(expr.left.operator).toBe('-');
      expectNumericLiteral(expr.left.left, 10);
      expectNumericLiteral(expr.left.right, 5);
    });
    
    it('should be left-associative for multiplication', async () => {
      const expr = await parseExpression('2 * 3 * 4');
      // Expected structure: ((2 * 3) * 4)
      expectBinaryExpression(expr, '*', undefined, 'number');
      expectNumericLiteral(expr.right, 4);
      
      // Left side should be 2 * 3
      expect(expr.left).toBeInstanceOf(BinaryExpression);
      expect(expr.left.operator).toBe('*');
      expectNumericLiteral(expr.left.left, 2);
      expectNumericLiteral(expr.left.right, 3);
    });
    
    it('should be left-associative for division', async () => {
      const expr = await parseExpression('16 / 4 / 2');
      // Expected structure: ((16 / 4) / 2)
      expectBinaryExpression(expr, '/', undefined, 'number');
      expectNumericLiteral(expr.right, 2);
      
      // Left side should be 16 / 4
      expect(expr.left).toBeInstanceOf(BinaryExpression);
      expect(expr.left.operator).toBe('/');
      expectNumericLiteral(expr.left.left, 16);
      expectNumericLiteral(expr.left.right, 4);
    });

    it('should be left-associative for multiplication', async () => {
      const expr = await parseExpression('2 * 3 * 4');
      // Expected structure: ((2 * 3) * 4)
      expect(expr.operator).toBe('*');
      expect(expr.right).toBeDefined();
      expect(expr.left).toBeInstanceOf(BinaryExpression);
      expect(expr.left.operator).toBe('*');
    });
  });

  describe('Comparison Operators', () => {
    it('should parse equality comparison', async () => {
      const expr = await parseExpression('a == b');
      expect(expr.operator).toBe('==');
    });

    it('should parse inequality comparison', async () => {
      const expr = await parseExpression('a != b');
      expect(expr.operator).toBe('!=');
    });
  });

  describe('Logical Operators', () => {
    it('should parse logical AND', async () => {
      const expr = await parseExpression('true && false');
      expect(expr.operator).toBe('&&');
    });

    it('should parse logical OR', async () => {
      const expr = await parseExpression('true || false');
      expect(expr.operator).toBe('||');
    });
  });
});
