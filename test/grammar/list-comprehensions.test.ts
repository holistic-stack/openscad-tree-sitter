/**
 * @file list-comprehensions.test.ts
 * @description Tests for list comprehensions in OpenSCAD
 */

import { describe, it, expect } from 'vitest';
import { parseCode, testParse, hasErrors } from '../helpers/parser-test-utils';

describe('OpenSCAD List Comprehensions', () => {
  describe('Basic List Comprehensions', () => {
    it('should parse basic list comprehension', () => {
      const code = `points = [for (i = [0:5]) [i, i*i, 0]];`;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse list comprehension with conditional', () => {
      const code = `filtered = [for (i = [0:10]) if (i % 2 == 0) i];`;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse nested list comprehensions', () => {
      const code = `grid = [for (x = [0:2]) for (y = [0:2]) [x, y]];`;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });
  
  describe('Complex List Comprehensions', () => {
    it('should parse list comprehension with complex expressions', () => {
      const code = `
        complex = [for (i = [0:10]) 
          if (i > 5 && i < 8) 
            [i, sin(i), cos(i)]
        ];
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse list comprehension with let expressions', () => {
      const code = `
        withLet = [for (i = [0:5]) let(j = i*i) [i, j, i+j]];
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse list comprehension with each syntax', () => {
      const code = `
        withEach = [for (p = points) each p];
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });
  
  describe('List Comprehension Edge Cases', () => {
    it('should parse empty list comprehension', () => {
      const code = `empty = [for (i = []) i];`;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse list comprehension with multiple conditionals', () => {
      const code = `
        multiCond = [for (i = [0:20]) 
          if (i > 5) 
            if (i < 15) 
              if (i % 2 == 0) 
                i
        ];
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse list comprehension with multiple iterators', () => {
      const code = `
        multiIter = [
          for (x = [0:2]) 
            for (y = [0:2]) 
              for (z = [0:2]) 
                [x, y, z]
        ];
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });
});
