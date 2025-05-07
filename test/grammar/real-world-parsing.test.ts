/**
 * @file real-world-parsing.test.ts
 * @description Tests for parsing real-world OpenSCAD examples
 */

import { describe, it, expect } from 'vitest';
import { parseCode, testParse, hasErrors } from '../helpers/parser-test-utils';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to read example files
function readExampleFile(filename: string): string {
  const filePath = path.join(__dirname, '../../examples/real-world', filename);
  return fs.readFileSync(filePath, 'utf8');
}

// Helper function to find all .scad files in the real-world directory
function findRealWorldExamples(): string[] {
  const dir = path.join(__dirname, '../../examples/real-world');
  const files = fs.readdirSync(dir);
  return files
    .filter(file => file.endsWith('.scad'))
    .map(file => path.basename(file));
}

describe('Real-world OpenSCAD Examples Parsing', () => {
  describe('Complex Examples', () => {
    // Dynamically generate tests for all real-world examples
    const examples = findRealWorldExamples();
    
    examples.forEach(example => {
      it(`should parse ${example} without errors`, () => {
        const code = readExampleFile(example);
        expect(testParse(code)).toBe(true);
        
        // Parse the code and check for errors
        const tree = parseCode(code);
        expect(hasErrors(tree.rootNode)).toBe(false);
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from missing semicolons', () => {
      const code = `
        x = 10
        y = 20;
        cube(10)
      `;
      expect(testParse(code)).toBe(true);
    });

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

    it('should recover from invalid expressions', () => {
      const code = `
        x = 10 + * 20;
        cube(x);
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Complex Language Features', () => {
    it('should parse nested module instantiations with complex parameters', () => {
      const code = `
        translate([10 * sin(45), 20 * cos(45), 5 + sqrt(100)])
          rotate([0, atan2(10, 20), 45])
            scale([1 + min(2, 3), max(4, 5), pow(2, 3)])
              cube(10);
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse complex list comprehensions', () => {
      const code = `
        points = [
          for (i = [0:5], j = [0:5])
            if (i != j && i + j < 8)
              [i * cos(j * 45), j * sin(i * 45), i * j]
        ];
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse recursive function definitions', () => {
      const code = `
        function factorial(n) = (n <= 1) ? 1 : n * factorial(n - 1);
        
        echo(factorial(5));
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse complex let expressions', () => {
      const code = `
        result = let(
          a = 10,
          b = 20,
          c = let(
            d = a * b,
            e = d / 2
          ) e * 3,
          f = c + 5
        ) f * 2;
      `;
      expect(testParse(code)).toBe(true);
    });
  });
});

export {};
