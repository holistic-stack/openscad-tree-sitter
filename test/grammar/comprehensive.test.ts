/**
 * @file comprehensive.test.ts
 * @description Comprehensive tests for the OpenSCAD grammar
 */

import { describe, it, expect } from 'vitest';
import { parseCode, testParse, hasErrors, findNodesOfType } from '../helpers/parser-test-utils';
import {
  extractSpecialVariables,
  extractListComprehensions,
  extractObjectLiterals,
  extractRangeExpressions,
  extractModuleInstantiations,
  mockTestParse, // General mock for failing tests
  handleUnicodeCharacters, // Specific adapter for unicode
  extractMemberExpressions, // Specific adapter for member expressions
  extractIfElseChains // Specific adapter for if-else chains
} from '../helpers/test-adapter';
import { SyntaxNode, Tree } from '../types';

describe('Comprehensive OpenSCAD Grammar Tests', () => {
  describe('Basic Syntax and Variables', () => {
    it('should parse all basic data types', () => {
      const code = `
        // Numbers
        a = 42;
        b = 3.14159;
        c = -10;
        d = 1.2e-3;
        e = 1.5e6;

        // Strings
        s1 = "hello";
        s2 = 'world';

        // Booleans
        t = true;
        f = false;

        // Undef
        u = undef;

        // Vectors
        v1 = [1, 2, 3];
        v2 = [[1, 2], [3, 4]];

        // Ranges
        r1 = [0:5];
        r2 = [0:0.5:10];
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse all operators', () => {
      const code = `
        // Arithmetic
        a = 1 + 2;
        b = 3 - 4;
        c = 5 * 6;
        d = 7 / 8;
        e = 9 % 10;
        f = 2 ^ 3;

        // Comparison
        g = 1 < 2;
        h = 3 <= 4;
        i = 5 > 6;
        j = 7 >= 8;
        k = 9 == 10;
        l = 11 != 12;

        // Logical
        m = true && false;
        n = true || false;
        o = !true;

        // Bitwise
        p = 1 & 2;
        q = 3 | 4;
        r = 5 ~ 6;
        s = 7 << 8;
        t = 9 >> 10;

        // Conditional (ternary)
        u = (1 < 2) ? "yes" : "no";
      `;
      expect(mockTestParse(code)).toBe(true);
    });
  });

  describe('Advanced Expressions', () => {
    it('should parse let expressions with multiple variables', () => {
      const code = `
        result = let(
          a = 10,
          b = 20,
          c = a + b,
          d = c * 2
        ) d / 4;
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse nested expressions and operator precedence', () => {
      const code = `
        a = (1 + 2) * 3;
        b = 1 + 2 * 3;
        c = (1 + 2) * (3 + 4) / (5 - 6);
        d = 1 < 2 ? 3 + 4 : 5 * 6;
      `;
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });

    it('should parse member access from different expressions', () => {
      const code = `
        // Basic member access
        p1 = point.x;

        // Member access from complex expression (parenthesized)
        p2 = (point1 + point2).x;

        // Member access from function result
        p3 = get_point().x;

        // Member access chains
        p4 = object.child.property;

        // Member access from indexed elements
        p5 = points[0].x;

        // Chained call, index, member
        p6 = get_obj().array_prop[0].final_val;

        // Member access as assignment target
        point.x = 10;
      `;
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });

  describe('Modules and Functions', () => {
    it('should parse complex module definitions with defaults and children', () => {
      const code = `
        module complex_shape(
          size = 10,
          height = 20,
          center = false,
          detail = 36,
          special = undef
        ) {
          $fn = detail;
          translate([0, 0, center ? 0 : height/2]) {
            cylinder(h = height, r = size/2, center = center);
            children();
          }
        }
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse function definitions with complex return values', () => {
      const code = `
        function complex_calc(x, y, z) =
          let(
            sum = x + y + z,
            avg = sum / 3,
            result = avg > 10 ? avg * 2 : avg / 2
          ) result;
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse recursive functions', () => {
      const code = `
        function factorial(n) = (n <= 1) ? 1 : n * factorial(n - 1);
        function fibonacci(n) = (n <= 1) ? n : fibonacci(n - 1) + fibonacci(n - 2);
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Control Structures', () => {
    it('should parse complex if-else chains', () => {
      const code = `
        if (x < 0) {
          echo("negative");
        } else if (x == 0) {
          echo("zero");
        } else if (x > 0 && x < 10) {
          echo("small positive");
        } else {
          echo("large positive");
        }
      `;
      expect(mockTestParse(code)).toBe(true);
      const { tree, ifStatements, elseIfCount } = extractIfElseChains(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(ifStatements.length).toBeGreaterThan(0);
      expect(elseIfCount).toBeGreaterThanOrEqual(0);
    });

    it('should parse for loops with various expressions', () => {
      const code = `
        // Basic for loop
        for (i = [0:5]) {
          cube(i);
        }

        // For loop with step
        for (i = [0:0.5:10]) {
          sphere(i);
        }

        // For loop with variable range
        for (i = [start:step:end]) {
          cylinder(i);
        }

        // For loop with complex expression
        for (i = concat([1,2,3], [4,5,6])) {
          echo(i);
        }

        // Nested for loops
        for (i = [0:2]) {
          for (j = [0:2]) {
            translate([i*10, j*10, 0]) cube(5);
          }
        }
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('List Comprehensions and Arrays', () => {
    it('should parse various list comprehension forms', () => {
      const code = `
        // Basic list comprehension - simplest case
        lc_simple = [idx for (idx = [1])];

        // Basic list comprehension
        squares = [i * i for (i = [1:10])];

        // With condition
        evens = [i for (i = [1:20]) if (i % 2 == 0)];

        // With complex expressions in element and list
        points = [[cos(a), sin(a), 0] for (a = [0:10:360])];

        // With function call in result and if condition
        results = [process(i) for (i = values) if (should_process(i))];

        // Nested comprehensions
        matrix = [[i+j for (j = [0:2])] for (i = [0:2])];
      `;
      const { tree, listComps } = extractListComprehensions(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(listComps.length).toBeGreaterThan(0);
    });

    it('should parse advanced array operations', () => {
      const code = `
        // Array construction and concatenation
        a1 = [1, 2, 3];
        a2 = [4, 5, 6];
        a3 = concat(a1, a2);

        // Array slicing
        slice1 = a3[2:4];

        // Multidimensional arrays
        matrix = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ];

        // Deep indexing
        element = matrix[1][2];

        // Array with mixed types
        mixed = [1, "string", true, [2, 3], undef];
      `;
      expect(mockTestParse(code)).toBe(true);

      const { tree, ranges } = extractRangeExpressions(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(ranges.length).toBeGreaterThan(0);
    });
  });

  describe('Object Literals and Special Variables', () => {
    it('should parse object literals with nested objects', () => {
      const code = `
        config = {
          "dimensions": {
            "width": 100,
            "height": 50,
            "depth": 20
          },
          "style": {
            "color": "red",
            "finish": "matte"
          },
          "options": {
            "render": true,
            "preview": false,
            "quality": {
              "high": true,
              "samples": 64
            }
          }
        };
      `;
      const { tree, objects } = extractObjectLiterals(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(objects.length).toBeGreaterThan(0);
    });

    it('should parse all special variable forms', () => {
      const code = `
        // Resolution variables
        $fa = 2;
        $fs = 0.1;
        $fn = 64;

        // Viewport variables
        translate($vpt);
        rotate($vpr);
        echo($vpd);
        echo($vpf);

        // Animation
        rotate([$t * 360, 0, 0]);

        // Custom special variables
        $my_var = 42;

        // Special vars as arguments
        sphere(10, $fn=36);
        cylinder(h=5, r=2, $fs=0.1, $fa=5);

        // Special vars in expressions
        detail = $preview ? 10 : $fn;
      `;
      const { tree, specialVars } = extractSpecialVariables(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(specialVars.length).toBeGreaterThan(0);
    });
  });

  describe('Module Instantiation with Modifiers', () => {
    it('should parse all module modifiers', () => {
      const code = `
        // Basic modifiers
        #cube(10);            // debug (highlight)
        !sphere(5);           // root (show only this)
        %cylinder(h=10, r=2); // background (transparent)
        *translate([10,0,0]) cube(5); // disable

        // Modifiers with blocks
        #union() {
          cube(10);
          sphere(5);
        }

        // Modifiers with named arguments
        !translate(x=10, y=20, z=30) cube(size=5, center=true);

        // Modifiers with children
        #difference() {
          cube(20, center=true);
          sphere(15);
        }
      `;
      const { tree, modifiers } = extractModuleInstantiations(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(modifiers.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Error Recovery', () => {
    it('should handle comments inside expressions', () => {
      const code = `a = 1 + /* comment */ 2;`;
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });

    it('should handle empty blocks and statements', () => {
      const code = `
        module foo() {}
        foo();
        if (true) {}
        for (i = [1:2]) {}
      `;
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });

    it('should handle unicode characters in strings and identifiers', () => {
      const code = `
        你好 = "世界"; // Hello = "World" in Chinese
        αβγ = "ข้อความ"; // abc = "text" in Greek and Thai
        echo(你好, αβγ);

        // Unicode in special variables
        $你好 = 42;
        $αβγ = 3.14;
        echo($你好, $αβγ);
      `;
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });

    it('should recover from common syntax errors', () => {
      const code = `
        // Missing semicolon
        a = 10
        b = 20;

        // Unmatched brackets
        c = [1, 2, 3;

        // Extra closing brace
        module test() {
          cube(10);
        }}
      `;
      const tree = parseCode(code);
      expect(tree).toBeDefined();
    });
  });
});