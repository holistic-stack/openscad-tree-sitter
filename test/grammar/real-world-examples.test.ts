/**
 * @file real-world-examples.test.ts
 * @description Tests for parsing real-world OpenSCAD examples
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

// Helper function to find all .scad files in a directory
function findScadFiles(dir: string): string[] {
  const files = fs.readdirSync(dir);
  return files
    .filter(file => file.endsWith('.scad'))
    .map(file => path.join(dir, file));
}

describe('Real-world OpenSCAD Examples', () => {
  describe('Example Files', () => {
    it('should parse sample.scad without errors', () => {
      const code = readExampleFile('sample.scad');
      expect(testParse(code)).toBe(true);
    });

    it('should parse indentation-test.scad without errors', () => {
      const code = readExampleFile('indentation-test.scad');
      expect(testParse(code)).toBe(true);
    });

    // Add more example files as needed
  });

  describe('Complex Language Features', () => {
    it('should parse nested module instantiations', () => {
      const code = `
        translate([0, 0, 0])
          rotate([0, 0, 45])
            scale([1, 1, 1])
              cube(10);
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse complex CSG operations', () => {
      const code = `
        difference() {
          union() {
            cube(20, center = true);
            translate([0, 0, 15])
              sphere(10);
          }
          
          intersection() {
            cylinder(h = 40, r = 8, center = true);
            rotate([90, 0, 0])
              cylinder(h = 40, r = 8, center = true);
          }
        }
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse list comprehensions', () => {
      const code = `
        function sum(v) = [for (i = v) 1] * v;
        
        points = [for (i = [0:5]) [i, i*i, 0]];
        
        values = [for (i = [0:2:10]) i];
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse special variables', () => {
      const code = `
        $fn = 100;
        cylinder(h = 10, r = 5);
        
        echo($t);
        
        if ($preview) {
          // Preview-only code
          color("red") sphere(5);
        }
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse module with children', () => {
      const code = `
        module frame(size) {
          difference() {
            cube(size, center = true);
            cube(size - [2, 2, 2], center = true);
          }
          children();
        }
        
        frame(20) {
          sphere(5);
          translate([0, 0, 10]) cube(5, center = true);
        }
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should parse empty modules and blocks', () => {
      const code = `
        module empty() {}
        
        if (true) {}
        
        for (i = [0:5]) {}
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse Unicode characters in strings and identifiers', () => {
      const code = `
        text_value = "Unicode: 你好, 世界!";
        
        module cube_測試(size) {
          cube(size);
        }
        
        cube_測試(10);
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse very long expressions', () => {
      const code = `
        result = 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20 + 
                 21 + 22 + 23 + 24 + 25 + 26 + 27 + 28 + 29 + 30 + 31 + 32 + 33 + 34 + 35 + 36 + 37 + 38 + 39 + 40;
      `;
      expect(testParse(code)).toBe(true);
    });
  });
});

export {};
