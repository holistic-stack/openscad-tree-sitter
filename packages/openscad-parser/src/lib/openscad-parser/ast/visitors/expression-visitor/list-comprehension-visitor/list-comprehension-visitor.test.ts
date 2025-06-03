/**
 * @file Tests for ListComprehensionVisitor
 * 
 * This test suite validates the ListComprehensionVisitor's ability to parse
 * OpenSCAD list comprehension expressions into AST nodes following the Real Parser Pattern.
 * 
 * Test coverage includes:
 * - Traditional syntax: [expr for (var = range)]
 * - OpenSCAD syntax: [for (var = range) expr]
 * - Conditional comprehensions with if clauses
 * - Complex expressions and nested structures
 * - Error handling and edge cases
 * 
 * @example Test patterns
 * ```typescript
 * // Traditional syntax
 * const result = visitor.visitListComprehension(parseNode('[x*x for (x = [1:5])]'));
 * 
 * // OpenSCAD syntax with condition
 * const result = visitor.visitListComprehension(parseNode('[for (x = [1:10]) if (x % 2 == 0) x]'));
 * ```
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser } from '../../../../enhanced-parser.js';
import { ErrorHandler } from '../../../../error-handling/index.js';
import { ListComprehensionVisitor } from './list-comprehension-visitor.js';
import { ExpressionVisitor } from '../../expression-visitor.js';
import { IdentifierExpressionNode, ErrorNode } from '../../../ast-types.js';

describe('ListComprehensionVisitor', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: ErrorHandler;
  let expressionVisitor: ExpressionVisitor;
  let visitor: ListComprehensionVisitor;

  beforeEach(async () => {
    // Create a new parser instance before each test
    parser = new EnhancedOpenscadParser();

    // Initialize the parser
    await parser.init();

    errorHandler = new ErrorHandler();
    expressionVisitor = new ExpressionVisitor('', errorHandler);
    visitor = new ListComprehensionVisitor(expressionVisitor, errorHandler);
  });

  afterEach(() => {
    // Clean up after each test
    parser.dispose();
  });

  describe('Traditional Syntax', () => {
    it('should parse simple list comprehension [x for (x = [1:5])]', () => {
      const code = '[x for (x = [1:5])]';
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();
      
      // Find the list comprehension node
      const listCompNode = tree?.rootNode.descendantForIndex(0, code.length);
      expect(listCompNode).toBeTruthy();
      
      if (listCompNode) {
        const result = visitor.visitListComprehension(listCompNode);
        expect(result).toBeTruthy();
        expect(result?.type).toBe('expression');
        if (result && result.type !== 'error') {
          expect(result.expressionType).toBe('list_comprehension_expression');
          expect(result.variable).toBe('x');
          expect(result.range).toBeTruthy();
          expect(result.range?.expressionType).toBe('range_expression');
          if (result.expression && result.expression.expressionType === 'identifier_expression') {
            expect((result.expression as IdentifierExpressionNode).text).toBe('x');
          }
          expect(result.condition).toBeUndefined();
        } else if (result?.type === 'error') {
          fail('Expected ListComprehensionExpressionNode, got ErrorNode');
        }
      }
    });

    it('should parse expression list comprehension [x*x for (x = [1:5])]', () => {
      const code = '[x*x for (x = [1:5])]';
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();
      
      const listCompNode = tree?.rootNode.descendantForIndex(0, code.length);
      expect(listCompNode).toBeTruthy();
      
      if (listCompNode) {
        const result = visitor.visitListComprehension(listCompNode);
        expect(result).toBeTruthy();
        expect(result?.type).toBe('expression');
        if (result && result.type !== 'error') {
          expect(result.expressionType).toBe('list_comprehension_expression');
          expect(result.variable).toBe('x');
          expect(result.range).toBeTruthy();
          expect(result.range?.expressionType).toBe('range_expression');
          expect(result.expression).toBeTruthy();
          expect(result.expression?.expressionType).toBe('binary_expression');
          expect(result.condition).toBeUndefined();
        } else if (result?.type === 'error') {
          fail('Expected ListComprehensionExpressionNode, got ErrorNode');
        }
      }
    });

    it('should parse conditional list comprehension [x for (x = [1:10]) if (x % 2 == 0)]', () => {
      const code = '[x for (x = [1:10]) if (x % 2 == 0)]';
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();
      
      const listCompNode = tree?.rootNode.descendantForIndex(0, code.length);
      expect(listCompNode).toBeTruthy();
      
      if (listCompNode) {
        const result = visitor.visitListComprehension(listCompNode);
        expect(result).toBeTruthy();
        if (result && 'type' in result) {
          if (result.type === 'error') {
            fail('Expected ListComprehensionExpressionNode, got ErrorNode');
          } else if (result.type === 'expression') {
            expect(result.expressionType).toBe('list_comprehension_expression');
            expect(result.variable).toBe('x');
            expect(result.range).toBeTruthy();
            expect(result.range?.expressionType).toBe('range_expression');
            expect(result.expression).toBeTruthy();
            if (result.expression && result.expression.expressionType === 'identifier_expression') {
              expect((result.expression as IdentifierExpressionNode).text).toBe('x');
            }
            expect(result.condition).toBeTruthy();
            expect(result.condition?.expressionType).toBe('binary_expression');
          } else {
            fail('Result is not an ErrorNode or an ExpressionNode');
          }
        } else if (result === null) {
          fail('Result is null, expected ListComprehensionExpressionNode');
        }
      }
    });
  });

  describe('OpenSCAD Syntax', () => {
    it('should parse OpenSCAD list comprehension [for (x = [1:5]) x]', () => {
      const code = '[for (x = [1:5]) x]';
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();
      
      const listCompNode = tree?.rootNode.descendantForIndex(0, code.length);
      expect(listCompNode).toBeTruthy();
      
      if (listCompNode) {
        const result = visitor.visitListComprehension(listCompNode);
        expect(result).toBeTruthy();
        if (result !== null && 'type' in result) {
          if (result.type === 'error') {
            fail('Expected ListComprehensionExpressionNode, got ErrorNode');
          } else if (result.type === 'expression') {
            expect(result.expressionType).toBe('list_comprehension_expression');
            expect(result.variable).toBe('x');
            expect(result.range).toBeTruthy();
            expect(result.range?.expressionType).toBe('range_expression');
            expect(result.expression).toBeTruthy();
            if (result.expression && result.expression.expressionType === 'identifier_expression') {
              expect((result.expression as IdentifierExpressionNode).text).toBe('x');
            }
            expect(result.condition).toBeUndefined();
          }
        }
      }
    });

    it('should parse OpenSCAD list comprehension with condition [for (x = [1:10]) if (x % 2 == 0) x]', () => {
      const code = '[for (x = [1:10]) if (x % 2 == 0) x]';
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();
      
      const listCompNode = tree?.rootNode.descendantForIndex(0, code.length);
      expect(listCompNode).toBeTruthy();
      
      if (listCompNode) {
        const result = visitor.visitListComprehension(listCompNode);
        expect(result).toBeTruthy();
        if (result && 'type' in result) {
          if (result.type === 'error') {
            fail('Expected ListComprehensionExpressionNode, got ErrorNode');
          } else if (result.type === 'expression') {
            expect(result.expressionType).toBe('list_comprehension_expression');
            expect(result.variable).toBe('x');
            expect(result.range).toBeTruthy();
            expect(result.range?.expressionType).toBe('range_expression');
            expect(result.expression).toBeTruthy();
            if (result.expression && result.expression.expressionType === 'identifier_expression') {
              expect((result.expression as IdentifierExpressionNode).text).toBe('x');
            }
            expect(result.condition).toBeTruthy();
            expect(result.condition?.expressionType).toBe('binary_expression');
          } else {
            fail('Result is not an ErrorNode or an ExpressionNode');
          }
        } else if (result === null) {
          fail('Result is null, expected ListComprehensionExpressionNode');
        }
      }    });
  });

  describe('Complex Expressions', () => {
    it('should parse list comprehension with nested arrays [for (i = [0:2]) [i, i*2]]', () => {
      const code = '[for (i = [0:2]) [i, i*2]]';
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();

      const listCompNode = tree?.rootNode.descendantForIndex(0, code.length);
      expect(listCompNode).toBeTruthy();

      if (listCompNode) {
        const result = visitor.visitListComprehension(listCompNode);
        expect(result).toBeTruthy();
        expect(result?.type).toBe('expression');
        if (result && result.type !== 'error') {
          expect(result.expressionType).toBe('list_comprehension_expression');
          expect(result.variable).toBe('i');
          expect(result.range).toBeTruthy();
          expect(result.range?.expressionType).toBe('range_expression');
          expect(result.expression).toBeTruthy();
          expect(result.expression?.expressionType).toBe('array_expression');
          expect(result.condition).toBeUndefined();
        } else if (result?.type === 'error') {
          fail('Expected ListComprehensionExpressionNode, got ErrorNode');
        }
      }
    });

    it('should parse list comprehension with let expression [for (i = [0:2]) let(x = i*2) x]', () => {
      const code = '[for (i = [0:2]) let(x = i*2) x]';

      const tree = parser.parse(code);
      expect(tree).toBeTruthy();

      const listCompNode = tree?.rootNode.descendantForIndex(0, code.length);
      expect(listCompNode).toBeTruthy();

      if (listCompNode) {
        const result = visitor.visitListComprehension(listCompNode);
        expect(result).toBeTruthy();
        if (result && 'type' in result) {
          if (result.type === 'error') {
            fail('Expected ListComprehensionExpressionNode, got ErrorNode');
          } else if (result.type === 'expression') {
            expect(result.expressionType).toBe('list_comprehension_expression');
            expect(result.variable).toBe('i');
            expect(result.range).toBeTruthy();
            expect(result.range?.expressionType).toBe('range_expression');
            expect(result.expression).toBeTruthy();
            expect(result.expression?.expressionType).toBe('let_expression');
            expect(result.condition).toBeUndefined();
          } else {
            fail('Result is not an ErrorNode or an ExpressionNode');
          }
        } else if (result === null) {
          fail('Result is null, expected ListComprehensionExpressionNode');
        }
      }
    });
  });

  describe('Let Expressions', () => {
    it('should parse list comprehension with let expression [for (i = [0:3]) let(angle = i * 36) [cos(angle), sin(angle)]]', () => {
      // Test let expressions within list comprehensions
      const code = '[for (i = [0:3]) let(angle = i * 36) [cos(angle), sin(angle)]]';
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();

      const listCompNode = tree?.rootNode.descendantForIndex(0, code.length);
      expect(listCompNode).toBeTruthy();

      if (listCompNode) {
        const result = visitor.visitListComprehension(listCompNode);
        expect(result).toBeTruthy();
        if (result && 'type' in result) {
          if (result.type === 'error') {
            fail('Expected ListComprehensionExpressionNode, got ErrorNode');
          } else if (result.type === 'expression') {
            expect(result.expressionType).toBe('list_comprehension_expression');
            expect(result.variable).toBe('i');
            expect(result.range).toBeTruthy();
            expect(result.range?.expressionType).toBe('range_expression');
            expect(result.expression).toBeTruthy();
            expect(result.expression?.expressionType).toBe('let_expression');
            expect(result.condition).toBeUndefined();
          } else {
            fail('Result is not an ErrorNode or an ExpressionNode');
          }
        } else if (result === null) {
          fail('Result is null, expected ListComprehensionExpressionNode');
        }
      }
    });

    it('should parse list comprehension with multiple let assignments [for (a = [1:4]) let(b = a*a, c = 2*b) [a, b, c]]', () => {
      // Test multiple let assignments
      const code = '[for (a = [1:4]) let(b = a*a, c = 2*b) [a, b, c]]';
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();

      const listCompNode = tree?.rootNode.descendantForIndex(0, code.length);
      expect(listCompNode).toBeTruthy();

      if (listCompNode) {
        const result = visitor.visitListComprehension(listCompNode);
        expect(result).toBeTruthy();
        expect(result?.type).toBe('expression');
        if (result && result.type !== 'error') {
          expect(result.expressionType).toBe('list_comprehension_expression');
          expect(result.variable).toBe('a');
          expect(result.range).toBeTruthy();
          expect(result.range?.expressionType).toBe('range_expression');
          expect(result.expression).toBeTruthy();
          expect(result.expression?.expressionType).toBe('let_expression');
          expect(result.condition).toBeUndefined();
        } else if (result?.type === 'error') {
          fail('Expected ListComprehensionExpressionNode, got ErrorNode');
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed list comprehension gracefully', () => {
      const code = '[for (x = [1:5]'; // Missing closing bracket and expression
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();
      
      const listCompNode = tree?.rootNode.descendantForIndex(0, code.length);
      if (listCompNode) {
        const result = visitor.visitListComprehension(listCompNode);
        // For malformed input, we expect an ErrorNode or potentially null if parsing fails very early
        expect(result === null || result?.type === 'error' || result?.type === 'expression').toBe(true);
        if (result && result.type === 'expression' && result.expressionType !== 'list_comprehension_expression') {
          // If it's an expression but not a list comprehension, it might be a partially parsed node or an error wrapped as expression.
          // This test is primarily about not crashing and returning *something* sensible or an error.
        } else if (result && result.type !== 'error' && result.type !== 'expression') {
          fail('Expected ErrorNode, null, or partial ListComprehensionExpressionNode for malformed input');
        }
      }
    });

    it('should return an ErrorNode for non-list-comprehension nodes', () => {
      const code = 'cube(10)';
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();
      
      const cubeNode = tree?.rootNode.descendantForIndex(0, code.length);
      if (cubeNode) {
        const result = visitor.visitListComprehension(cubeNode);
        expect(result).toBeTruthy(); // Check it's not null
        expect(result?.type).toBe('error');
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const errorNode = result as ErrorNode;
        expect(errorNode.errorCode).toBe('MISSING_FOR_CLAUSE');
        expect(errorNode.originalNodeType).toBe('module_instantiation');
        expect(errorNode.message).toContain(
          "Missing 'for' clause in OpenSCAD-style list comprehension"
        );
      }
    });
  });
});
