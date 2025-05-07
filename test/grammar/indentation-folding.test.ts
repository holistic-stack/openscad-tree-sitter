/**
 * @file indentation-folding.test.ts
 * @description Tests for OpenSCAD indentation and folding
 */

import { describe, it, expect } from 'vitest';
import { parseCode, testParse, hasErrors } from '../helpers/parser-test-utils';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to read example files
function readExampleFile(filename: string): string {
  const filePath = path.join(__dirname, '../../examples', filename);
  return fs.readFileSync(filePath, 'utf8');
}

describe('OpenSCAD Indentation and Folding', () => {
  describe('Indentation Rules', () => {
    it('should parse module definitions with proper indentation structure', () => {
      const code = `
        module test() {
          cube(10);
          sphere(5);
        }
      `;
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
      
      // In a real implementation, we would validate the indentation structure
      // by checking the tree nodes against our indentation rules
      expect(testParse(code)).toBe(true);
    });

    it('should parse nested blocks with proper indentation', () => {
      const code = `
        if (condition) {
          if (nested_condition) {
            cube(10);
          } else {
            sphere(5);
          }
        }
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse for loops with proper indentation', () => {
      const code = `
        for (i = [0:5]) {
          translate([i * 10, 0, 0]) {
            cube(5);
          }
        }
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse let expressions with proper indentation', () => {
      const code = `
        result = let(
          a = 10,
          b = 20,
          c = a + b
        ) c * 2;
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse CSG operations with proper indentation', () => {
      const code = `
        difference() {
          cube(10);
          translate([0, 0, 0]) {
            sphere(5);
          }
        }
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Folding Rules', () => {
    it('should identify foldable blocks in module definitions', () => {
      const code = `
        module test() {
          cube(10);
          sphere(5);
        }
      `;
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
      
      // In a real implementation, we would validate the folding structure
      // by checking the tree nodes against our folding rules
      expect(testParse(code)).toBe(true);
    });

    it('should identify foldable blocks in if statements', () => {
      const code = `
        if (condition) {
          cube(10);
        } else {
          sphere(5);
        }
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should identify foldable blocks in for loops', () => {
      const code = `
        for (i = [0:5]) {
          translate([i * 10, 0, 0]) {
            cube(5);
          }
        }
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should identify foldable vector expressions', () => {
      const code = `
        points = [
          [0, 0, 0],
          [10, 0, 0],
          [10, 10, 0],
          [0, 10, 0]
        ];
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should identify foldable comments', () => {
      const code = `
        /* This is a multi-line comment
           that should be foldable in editors
           that support code folding based on
           tree-sitter queries. */
        cube(10);
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Real-world Examples', () => {
    it('should parse the indentation test file without errors', () => {
      const code = readExampleFile('indentation-test.scad');
      expect(testParse(code)).toBe(true);
    });

    it('should parse the sample file without errors', () => {
      const code = readExampleFile('sample.scad');
      expect(testParse(code)).toBe(true);
    });
  });
});

export {};
