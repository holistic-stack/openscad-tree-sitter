/**
 * @file advanced-features.test.js
 * @description Tests for advanced OpenSCAD syntax features
 */

import { describe, it, expect } from 'vitest';
const { parseCode, testParse, hasErrors, findNodesOfType } = require('../helpers/parser-test-utils');

describe('Advanced OpenSCAD Features', () => {
  describe('Let Expressions', () => {
    it('should parse simple let expression', () => {
      const code = `
        x = let(a = 10) a * 2;
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse multi-variable let expression', () => {
      const code = `
        result = let(
          width = 10, 
          height = 20, 
          depth = 30
        ) width * height * depth;
      `;
      const tree = parseCode(code);
      const letExpressions = findNodesOfType(tree, 'let_expression');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(letExpressions.length).toBe(1);
    });

    it('should parse nested let expressions', () => {
      const code = `
        result = let(
          outer = 10,
          inner = let(
            a = 5,
            b = 3
          ) a + b
        ) outer * inner;
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('List Comprehensions', () => {
    it('should parse list comprehension', () => {
      const code = `
        x = [for (i = [0:5]) i * i];
      `;
      const tree = parseCode(code);
      const listComps = findNodesOfType(tree, 'list_comprehension');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(listComps.length).toBe(1);
    });

    it('should parse list comprehension with conditional', () => {
      const code = `
        x = [for (i = [0:10]) if (i % 2 == 0) i];
      `;
      const tree = parseCode(code);
      const listComps = findNodesOfType(tree, 'list_comprehension');
      const ifNodes = findNodesOfType(tree, 'list_comprehension_if');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(listComps.length).toBe(1);
      expect(ifNodes.length).toBe(1);
    });

    it('should parse nested list comprehensions', () => {
      const code = `
        matrix = [for (i = [0:3]) [for (j = [0:3]) i * 10 + j]];
      `;
      const tree = parseCode(code);
      const listComps = findNodesOfType(tree, 'list_comprehension');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(listComps.length).toBe(2); // should find two list comprehensions (nested)
    });
  });

  describe('Special Variables', () => {
    it('should parse $fa, $fs, $fn variables', () => {
      const code = `
        $fa = 2;
        $fs = 0.5;
        $fn = 36;
        sphere(r=10);
      `;
      const tree = parseCode(code);
      const specialVars = findNodesOfType(tree, 'special_variable');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(specialVars.length).toBe(3);
    });

    it('should parse $t animation variable', () => {
      const code = `
        angle = 360 * $t;
        rotate([0, 0, angle]) cube(10);
      `;
      const tree = parseCode(code);
      const specialVars = findNodesOfType(tree, 'special_variable');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(specialVars.length).toBe(1);
      expect(specialVars[0].text).toBe('$t');
    });

    it('should parse viewport variables', () => {
      const code = `
        echo($vpr, $vpt, $vpd, $vpf);
      `;
      const tree = parseCode(code);
      const specialVars = findNodesOfType(tree, 'special_variable');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(specialVars.length).toBe(4);
    });
  });

  describe('Control Structures', () => {
    it('should parse if statement', () => {
      const code = `
        if (x > 10) {
          sphere(10);
        } else {
          cube(10);
        }
      `;
      const tree = parseCode(code);
      const ifStatements = findNodesOfType(tree, 'if_statement');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(ifStatements.length).toBe(1);
    });

    it('should parse for loop', () => {
      const code = `
        for (i = [0:5]) {
          translate([i * 10, 0, 0]) cube(5);
        }
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse for loop with range steps', () => {
      const code = `
        for (i = [0:2:10]) {
          echo(i);
        }
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Echo and Assert', () => {
    it('should parse echo statement', () => {
      const code = `
        echo("Hello", 123, true);
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

  describe('Vector and Range Operations', () => {
    it('should parse vector indexing', () => {
      const code = `
        v = [1, 2, 3, 4, 5];
        x = v[2];
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse vector expressions', () => {
      const code = `
        v1 = [1, 2, 3];
        v2 = [4, 5, 6];
        v3 = concat(v1, v2);
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse range expressions', () => {
      const code = `
        r1 = [1:5];
        r2 = [0:0.5:10];
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Extended Function Features', () => {
    it('should parse function recursive call', () => {
      const code = `
        function factorial(n) = n <= 1 ? 1 : n * factorial(n - 1);
        result = factorial(5);
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse function with default parameters', () => {
      const code = `
        function vec_add(v1, v2=[0,0,0]) = [v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2]];
      `;
      expect(testParse(code)).toBe(true);
    });
  });
}); 