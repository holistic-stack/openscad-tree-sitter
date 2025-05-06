/**
 * @file basic-syntax.test.js
 * @description Tests for basic OpenSCAD syntax parsing
 */

import { describe, it, expect } from 'vitest';
const { parseCode, testParse, hasErrors, findNodesOfType } = require('../helpers/parser-test-utils');

describe('Basic OpenSCAD Syntax', () => {
  describe('Comments', () => {
    it('should parse single-line comments', () => {
      const code = `
        // This is a comment
        cube(10); // This is another comment
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse multi-line comments', () => {
      const code = `
        /* This is a
           multi-line comment */
        cube(10);
        /* Another
           multi-line
           comment */
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse nested multi-line comments', () => {
      const code = `
        /* This is a /* nested */ comment */
        cube(10);
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Variable Assignment', () => {
    it('should parse basic assignment', () => {
      const code = 'x = 10;';
      const tree = parseCode(code);
      const assignments = findNodesOfType(tree, 'assignment_statement');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(assignments.length).toBe(1);
      expect(assignments[0].childForFieldName('name').text).toBe('x');
    });

    it('should parse multiple assignments', () => {
      const code = `
        x = 10;
        y = 20;
        z = x + y;
      `;
      const tree = parseCode(code);
      const assignments = findNodesOfType(tree, 'assignment_statement');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(assignments.length).toBe(3);
    });

    it('should parse complex expressions in assignments', () => {
      const code = 'result = a > 5 ? true : (b == 10 && c < 15);';
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Modules and Functions', () => {
    it('should parse simple module definition', () => {
      const code = `
        module test() {
          cube(10);
        }
      `;
      const tree = parseCode(code);
      const modules = findNodesOfType(tree, 'module_definition');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(modules.length).toBe(1);
      expect(modules[0].childForFieldName('name').text).toBe('test');
    });

    it('should parse module with parameters', () => {
      const code = `
        module box(width = 10, height = 20, depth = 30) {
          cube([width, height, depth]);
        }
      `;
      expect(testParse(code)).toBe(true);
    });

    it('should parse simple function definition', () => {
      const code = `
        function add(a, b) = a + b;
      `;
      const tree = parseCode(code);
      const functions = findNodesOfType(tree, 'function_definition');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(functions.length).toBe(1);
      expect(functions[0].childForFieldName('name').text).toBe('add');
    });

    it('should parse complex function definition', () => {
      const code = `
        function calculate(x, y, z) = 
          let(
            sum = x + y + z,
            avg = sum / 3
          )
          avg > 10 ? avg * 2 : avg / 2;
      `;
      expect(testParse(code)).toBe(true);
    });
  });

  describe('Module Instantiation', () => {
    it('should parse simple module instantiation', () => {
      const code = 'cube(10);';
      const tree = parseCode(code);
      const modules = findNodesOfType(tree, 'module_instantiation');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(modules.length).toBe(1);
      expect(modules[0].childForFieldName('name').text).toBe('cube');
    });

    it('should parse module instantiation with modifiers', () => {
      const code = `
        #cube(10);
        !sphere(r=5);
        %cylinder(h=10, r=2);
        *translate([0,0,10]) cube(5);
      `;
      const tree = parseCode(code);
      const modules = findNodesOfType(tree, 'module_instantiation');
      
      expect(hasErrors(tree.rootNode)).toBe(false);
      expect(modules.length).toBe(4);
      expect(modules[0].childForFieldName('name').text).toBe('cube');
      
      // Check that modifiers are parsed correctly
      const modifiers = findNodesOfType(tree, 'modifier');
      expect(modifiers.length).toBe(4);
      expect(modifiers[0].text).toBe('#');
      expect(modifiers[1].text).toBe('!');
      expect(modifiers[2].text).toBe('%');
      expect(modifiers[3].text).toBe('*');
    });

    it('should parse nested module instantiation', () => {
      const code = `
        translate([0, 0, 10]) {
          rotate([0, 45, 0]) {
            cube(10);
          }
        }
      `;
      expect(testParse(code)).toBe(true);
    });
  });
}); 