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
        expect(result?.expressionType).toBe('list_comprehension_expression');
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
        expect(result?.expressionType).toBe('list_comprehension_expression');
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
        expect(result?.type).toBe('expression');
        expect(result?.expressionType).toBe('list_comprehension_expression');
        // Should have a condition
        expect((result as any)?.condition).toBeTruthy();
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
        expect(result?.type).toBe('expression');
        expect(result?.expressionType).toBe('list_comprehension_expression');
      }
    });

    it('should parse OpenSCAD conditional list comprehension [for (x = [1:10]) if (x % 2 == 0) x]', () => {
      const code = '[for (x = [1:10]) if (x % 2 == 0) x]';
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();
      
      const listCompNode = tree?.rootNode.descendantForIndex(0, code.length);
      expect(listCompNode).toBeTruthy();
      
      if (listCompNode) {
        const result = visitor.visitListComprehension(listCompNode);
        expect(result).toBeTruthy();
        expect(result?.type).toBe('expression');
        expect(result?.expressionType).toBe('list_comprehension_expression');
        // Should have a condition
        expect((result as any)?.condition).toBeTruthy();
      }
    });
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
        expect(result?.expressionType).toBe('list_comprehension_expression');
      }
    });

    it.skip('should parse list comprehension with let expression [for (i = [0:5]) let(angle = i * 36) [cos(angle), sin(angle)]]', () => {
      // Skipped: let expressions are not yet implemented
      // This test will be enabled when let expression visitor is implemented
      const code = '[for (i = [0:5]) let(angle = i * 36) [cos(angle), sin(angle)]]';
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();

      const listCompNode = tree?.rootNode.descendantForIndex(0, code.length);
      expect(listCompNode).toBeTruthy();

      if (listCompNode) {
        const result = visitor.visitListComprehension(listCompNode);
        expect(result).toBeTruthy();
        expect(result?.type).toBe('expression');
        expect(result?.expressionType).toBe('list_comprehension_expression');
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
        // Should either return null or a partial result
        expect(result === null || result?.type === 'expression').toBe(true);
      }
    });

    it('should return null for non-list-comprehension nodes', () => {
      const code = 'cube(10)';
      const tree = parser.parse(code);
      expect(tree).toBeTruthy();
      
      const cubeNode = tree?.rootNode.descendantForIndex(0, code.length);
      if (cubeNode) {
        const result = visitor.visitListComprehension(cubeNode);
        expect(result).toBeNull();
      }
    });
  });
});
