/**
 * @file error-recovery.test.ts
 * @description Tests for error recovery in the OpenSCAD grammar
 */

import { describe, it, expect } from 'vitest';
import { parseCode, testParse, hasErrors } from '../helpers/parser-test-utils';

describe('OpenSCAD Error Recovery', () => {
  describe('Missing Semicolons', () => {
    it('should recover from missing semicolons in assignments', () => {
      const code = `
        x = 10
        y = 20;
        z = 30
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should recover from missing semicolons in function calls', () => {
      const code = `
        cube(10)
        sphere(5);
        cylinder(h=10, r=5)
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Unbalanced Delimiters', () => {
    it('should recover from unbalanced parentheses', () => {
      const code = `
        module test( {
          cube(10);
        }
        
        test();
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should recover from unbalanced braces', () => {
      const code = `
        module test() {
          if (true) {
            cube(10);
          
          cube(20);
        }
        
        test();
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should recover from unbalanced brackets', () => {
      const code = `
        a = [1, 2, 3;
        b = [4, 5, 6];
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Unterminated Strings', () => {
    it('should recover from unterminated double-quoted strings', () => {
      const code = `
        a = "unterminated string;
        b = "properly terminated string";
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should recover from unterminated single-quoted strings', () => {
      const code = `
        a = 'unterminated string;
        b = 'properly terminated string';
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Invalid Expressions', () => {
    it('should recover from invalid binary expressions', () => {
      const code = `
        x = 10 + * 20;
        y = 30 - / 40;
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should recover from invalid function arguments', () => {
      const code = `
        cube(10, , 30);
        sphere(r=, $fn=36);
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Complex Error Recovery', () => {
    it('should recover from multiple errors in a single file', () => {
      const code = `
        // Missing semicolon
        x = 10
        
        // Unbalanced parenthesis
        module test( {
          // Unterminated string
          echo("hello world;
          
          // Invalid expression
          y = 20 + * 30;
          
          // Unbalanced bracket
          z = [1, 2, 3;
        }
        
        test();
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should recover from errors in nested structures', () => {
      const code = `
        module outer() {
          module inner( {
            if (true {
              for (i = [0:5) {
                cube([i, i, i);
              }
            }
          }
        }
        
        outer();
      `;
      expect(testParse(code)).toBe(true);
    });
  });
});
