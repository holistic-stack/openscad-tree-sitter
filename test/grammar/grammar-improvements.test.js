/**
 * @file grammar-improvements.test.js
 * @description Tests for specific areas of the grammar that need improvement
 */

import { describe, it, expect } from 'vitest';
const { parseCode, testParse, hasErrors, findNodesOfType } = require('../helpers/parser-test-utils');

describe('Grammar Improvements', () => {
  describe('List Comprehensions', () => {
    it('should parse basic list comprehension syntax', () => {
      const code = `
        a = [for (i = [0:5]) i];
      `;
      // This should now pass with our list comprehension implementation
      expect(testParse(code)).toBe(true);
    });
    
    it('should parse list comprehension with conditionals', () => {
      const code = `
        a = [for (i = [0:10]) if (i % 2 == 0) i];
      `;
      // This should now pass with our list comprehension implementation
      expect(testParse(code)).toBe(true);
    });
    
    it('should parse nested list comprehensions', () => {
      const code = `
        a = [for (i = [0:3]) [for (j = [0:3]) i * 10 + j]];
      `;
      // This should now pass with our list comprehension implementation
      expect(testParse(code)).toBe(true);
    });
  });
  
  describe('Special Variables', () => {
    it('should parse special variable names', () => {
      const code = `
        $fn = 36;
        sphere(r=10, $fn=72);
      `;
      // Special variables should be correctly handled
      const tree = parseCode(code);
      const assignments = findNodesOfType(tree, 'assignment_statement');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(assignments.length).toBe(1);
      expect(assignments[0].childForFieldName('name').text).toBe('$fn');
    });
    
    it('should parse module instantiation with special variables as named arguments', () => {
      const code = `
        sphere(r=10, $fn=36);
      `;
      const tree = parseCode(code);
      const modules = findNodesOfType(tree, 'module_instantiation');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(modules.length).toBe(1);
      
      // Detect if the named argument with $ is being parsed correctly
      const args = findNodesOfType(tree, 'argument');
      const namedArgs = args.filter(arg => arg.childCount > 1);
      
      // Check if there are two named arguments (r=10 and $fn=36)
      expect(namedArgs.length).toBe(2);
    });
  });
  
  describe('Control Structures', () => {
    it('should parse if-else-if chains', () => {
      const code = `
        if (x < 0) {
          echo("negative");
        } else if (x == 0) {
          echo("zero");
        } else {
          echo("positive");
        }
      `;
      // This should now pass with our if statement implementation
      expect(testParse(code)).toBe(true);
    });
    
    it('should parse for loops with complex iterator expressions', () => {
      const code = `
        for (i = concat([1,2,3], [4,5,6])) {
          echo(i);
        }
      `;
      expect(testParse(code)).toBe(true);
    });
  });
  
  describe('Member Access and Indexing', () => {
    it('should parse member access expressions', () => {
      const code = `
        point = [10, 20, 30];
        x = point.x;
      `;
      // This should pass with our member expression implementation
      expect(testParse(code)).toBe(true);
    });
    
    it('should parse complex indexing expressions', () => {
      const code = `
        matrix = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ];
        value = matrix[1][2];
      `;
      // This should now pass with our index expression implementation
      expect(testParse(code)).toBe(true);
    });
  });
  
  describe('Include and Use Statements', () => {
    it('should parse include without semicolon', () => {
      const code = `
        include <shapes.scad>
        cube(10);
      `;
      // This should now pass with our updated include statement
      expect(testParse(code)).toBe(true);
    });
    
    it('should parse use without semicolon', () => {
      const code = `
        use <utils.scad>
        cube(10);
      `;
      // This should now pass with our updated use statement
      expect(testParse(code)).toBe(true);
    });
  });
  
  describe('Echo and Assert Statements', () => {
    it('should parse echo statement with multiple expressions', () => {
      const code = `
        echo("Value:", 10, true, [1,2,3]);
      `;
      expect(testParse(code)).toBe(true);
    });
    
    it('should parse assert statement', () => {
      const code = `
        assert(x > 0, "x must be positive");
      `;
      expect(testParse(code)).toBe(true);
    });
  });
}); 