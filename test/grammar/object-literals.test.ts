/**
 * @file object-literals.test.ts
 * @description Tests for object literals in OpenSCAD
 */

import { describe, it, expect } from 'vitest';
import { parseCode, testParse, hasErrors } from '../helpers/parser-test-utils';

describe('OpenSCAD Object Literals', () => {
  describe('Basic Object Literals', () => {
    it('should parse empty object literal', () => {
      const code = `settings = {};`;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse object literal with single property', () => {
      const code = `settings = { "resolution": 32 };`;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse object literal with multiple properties', () => {
      const code = `
        settings = {
          "resolution": 32,
          "size": 10,
          "material": "plastic"
        };
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });
  
  describe('Nested Object Literals', () => {
    it('should parse object literal with nested object', () => {
      const code = `
        config = {
          "dimensions": {
            "width": 100,
            "height": 50
          }
        };
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse object literal with multiple nested objects', () => {
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
            "preview": false
          }
        };
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse deeply nested object literals', () => {
      const code = `
        config = {
          "options": {
            "render": {
              "quality": {
                "high": true,
                "samples": 64
              },
              "mode": "normal"
            }
          }
        };
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });
  
  describe('Object Literals with Various Value Types', () => {
    it('should parse object literal with string values', () => {
      const code = `
        strings = {
          "name": "OpenSCAD",
          "version": "2021.01",
          "license": "GPL"
        };
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse object literal with number values', () => {
      const code = `
        numbers = {
          "integer": 42,
          "float": 3.14159,
          "negative": -10,
          "scientific": 1.2e-3
        };
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse object literal with boolean values', () => {
      const code = `
        flags = {
          "enabled": true,
          "visible": false,
          "debug": true
        };
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse object literal with array values', () => {
      const code = `
        arrays = {
          "points": [[0, 0], [1, 1], [2, 2]],
          "colors": ["red", "green", "blue"],
          "mixed": [1, "two", true]
        };
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse object literal with mixed value types', () => {
      const code = `
        mixed = {
          "name": "OpenSCAD",
          "version": 2021.01,
          "features": ["extrude", "rotate", "translate"],
          "enabled": true,
          "settings": {
            "quality": "high",
            "preview": false
          }
        };
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });
});
