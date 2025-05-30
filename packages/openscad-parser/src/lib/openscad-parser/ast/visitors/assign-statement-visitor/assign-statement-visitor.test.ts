/**
 * @file Tests for AssignStatementVisitor
 * 
 * This test suite validates the AssignStatementVisitor's ability to parse and convert
 * OpenSCAD assign statements from Tree-sitter CST nodes into structured AST nodes.
 * 
 * The tests cover:
 * - Basic assign statements with single assignments
 * - Multiple assignments within assign statements
 * - Complex expressions in assignment values
 * - Assign statements with blocks vs single statements
 * - Edge cases and error handling
 * 
 * @author OpenSCAD Parser Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser, SimpleErrorHandler } from '../../../../index.js';
import type { AssignStatementNode, AssignmentNode } from '../../ast-types.js';

describe('AssignStatementVisitor', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: SimpleErrorHandler;

  beforeEach(async () => {
    errorHandler = new SimpleErrorHandler();
    parser = new EnhancedOpenscadParser(errorHandler);
    await parser.init();
  });

  afterEach(() => {
    parser.dispose();
  });

  describe('Basic Assign Statements', () => {
    it('should parse basic assign statement with single assignment', () => {
      const code = 'assign(x = 5) cube(x);';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('assign');

      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(1);
      expect(assignNode.assignments[0].variable).toBe('x');
      expect(assignNode.assignments[0].value).toBeDefined();
      expect(assignNode.body).toBeDefined();
      expect(assignNode.body.type).toBe('module_instantiation');
    });

    it('should parse assign statement with boolean value', () => {
      const code = 'assign(flag = true) cube(1);';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(1);
      expect(assignNode.assignments[0].variable).toBe('flag');
      expect(assignNode.assignments[0].value).toBeDefined();
    });

    it('should parse assign statement with string value', () => {
      const code = 'assign(name = "test") echo(name);';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(1);
      expect(assignNode.assignments[0].variable).toBe('name');
      expect(assignNode.assignments[0].value).toBeDefined();
    });
  });

  describe('Multiple Assignments', () => {
    it('should parse assign statement with multiple assignments', () => {
      const code = 'assign(x = 5, y = 10) cube([x, y, 1]);';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(2);
      
      expect(assignNode.assignments[0].variable).toBe('x');
      expect(assignNode.assignments[0].value).toBeDefined();
      
      expect(assignNode.assignments[1].variable).toBe('y');
      expect(assignNode.assignments[1].value).toBeDefined();
      
      expect(assignNode.body).toBeDefined();
      expect(assignNode.body.type).toBe('module_instantiation');
    });

    it('should parse assign statement with three assignments', () => {
      const code = 'assign(x = 1, y = 2, z = 3) cube([x, y, z]);';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(3);
      
      expect(assignNode.assignments[0].variable).toBe('x');
      expect(assignNode.assignments[1].variable).toBe('y');
      expect(assignNode.assignments[2].variable).toBe('z');
    });

    it('should parse assign statement with mixed value types', () => {
      const code = 'assign(num = 42, str = "hello", flag = false) echo(num, str, flag);';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(3);
      
      expect(assignNode.assignments[0].variable).toBe('num');
      expect(assignNode.assignments[1].variable).toBe('str');
      expect(assignNode.assignments[2].variable).toBe('flag');
    });
  });

  describe('Complex Expressions', () => {
    it('should parse assign statement with arithmetic expressions', () => {
      const code = 'assign(result = a + b * 2) cube(result);';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(1);
      expect(assignNode.assignments[0].variable).toBe('result');
      expect(assignNode.assignments[0].value).toBeDefined();
    });

    it('should parse assign statement with function calls', () => {
      const code = 'assign(angle = sin(45), radius = cos(30)) sphere(radius);';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(2);
      expect(assignNode.assignments[0].variable).toBe('angle');
      expect(assignNode.assignments[1].variable).toBe('radius');
    });

    it('should parse assign statement with array expressions', () => {
      const code = 'assign(points = [[0,0], [1,1], [2,0]]) polygon(points);';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(1);
      expect(assignNode.assignments[0].variable).toBe('points');
      expect(assignNode.assignments[0].value).toBeDefined();
    });

    it('should parse assign statement with range expressions', () => {
      const code = 'assign(range = [1:5]) for(i = range) cube(i);';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(1);
      expect(assignNode.assignments[0].variable).toBe('range');
      expect(assignNode.assignments[0].value).toBeDefined();
    });
  });

  describe('Block Bodies', () => {
    it('should parse assign statement with block body', () => {
      const code = 'assign(r = 10) { sphere(r); translate([r*2, 0, 0]) sphere(r); }';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(1);
      expect(assignNode.assignments[0].variable).toBe('r');
      expect(assignNode.body).toBeDefined();
      expect(assignNode.body.type).toBe('block');
    });

    it('should parse assign statement with complex block', () => {
      const code = `assign(size = 10, height = 20) {
        cube([size, size, height]);
        translate([size + 5, 0, 0]) cylinder(r = size/2, h = height);
      }`;
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(2);
      expect(assignNode.assignments[0].variable).toBe('size');
      expect(assignNode.assignments[1].variable).toBe('height');
      expect(assignNode.body.type).toBe('block');
    });
  });

  describe('Edge Cases', () => {
    it('should handle assign statement with no assignments', () => {
      const code = 'assign() cube(1);';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(0);
      expect(assignNode.body).toBeDefined();
    });

    it('should handle assign statement without semicolon', () => {
      const code = 'assign(x = 5) cube(x)';
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(1);
      const assignNode = ast[0] as AssignStatementNode;
      expect(assignNode.assignments).toHaveLength(1);
      expect(assignNode.assignments[0].variable).toBe('x');
    });

    it('should handle multiple assign statements', () => {
      const code = `
        assign(x = 5) cube(x);
        assign(y = 10) sphere(y);
      `;
      const ast = parser.parseAST(code);

      expect(ast).toHaveLength(2);
      expect(ast[0].type).toBe('assign');
      expect(ast[1].type).toBe('assign');
      
      const firstAssign = ast[0] as AssignStatementNode;
      const secondAssign = ast[1] as AssignStatementNode;
      
      expect(firstAssign.assignments[0].variable).toBe('x');
      expect(secondAssign.assignments[0].variable).toBe('y');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed assign statement gracefully', () => {
      const code = 'assign(x =) cube(1);';
      const ast = parser.parseAST(code);

      // Should still parse but may have incomplete assignment
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('assign');
    });

    it('should handle assign statement with missing body', () => {
      const code = 'assign(x = 5)';
      const ast = parser.parseAST(code);

      // Parser should handle this gracefully
      expect(ast).toHaveLength(1);
    });
  });
});
