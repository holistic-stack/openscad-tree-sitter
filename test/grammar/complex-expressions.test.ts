/**
 * @file complex-expressions.test.ts
 * @description Tests for complex expressions in OpenSCAD
 */

import { describe, it, expect } from 'vitest';
import { parseCode, testParse, hasErrors } from '../helpers/parser-test-utils';

describe('OpenSCAD Complex Expressions', () => {
  describe('Nested Mathematical Expressions', () => {
    it('should parse complex mathematical expressions with correct precedence', () => {
      const code = `
        a = 1 + 2 * 3 - 4 / 2;  // 1 + 6 - 2 = 5
        b = (1 + 2) * (3 - 4) / 2;  // 3 * (-1) / 2 = -1.5
        c = 2 ^ 3 * 4 + 5;  // 8 * 4 + 5 = 37
        d = -2 * 3 + 4 ^ 2;  // -6 + 16 = 10
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse expressions with multiple unary operators', () => {
      const code = `
        a = -(-2);  // 2
        b = !false;  // true
        c = !!true;  // true
        d = -!-!false;  // -1
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });
  
  describe('Nested Function Calls', () => {
    it('should parse nested function calls', () => {
      const code = `
        a = sin(cos(30));
        b = max(min(10, 5), abs(-3));
        c = len(concat([1, 2], [3, 4]));
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse function calls with complex arguments', () => {
      const code = `
        a = pow(2 + 3, 4 * 5);
        b = sqrt(pow(x, 2) + pow(y, 2));
        c = atan2(sin(angle), cos(angle));
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse chained function calls in module instantiations', () => {
      const code = `
        translate([10, 20, 30])
          rotate([0, 45, 0])
            scale([1.5, 1.5, 1.5])
              cube(10);
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });
  
  describe('Complex Conditional Expressions', () => {
    it('should parse complex conditional expressions', () => {
      const code = `
        a = x > 0 ? x * 2 : x / 2;
        b = x > 0 && y > 0 ? x + y : x > 0 ? x : y > 0 ? y : 0;
        c = (a > b) ? (a < c ? a : c) : (b < c ? b : c);
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse conditional expressions with function calls', () => {
      const code = `
        a = len(arr) > 0 ? arr[0] : undef;
        b = is_num(x) ? sin(x) : is_list(x) ? len(x) : 0;
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });
  
  describe('Let Expressions', () => {
    it('should parse basic let expressions', () => {
      const code = `
        a = let(x = 10) x * 2;
        b = let(x = 5, y = 10) x + y;
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse nested let expressions', () => {
      const code = `
        a = let(x = 10) let(y = x * 2) x + y;
        b = let(
          x = 5,
          y = let(z = x * 2) z + 1
        ) x + y;
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse let expressions with complex expressions', () => {
      const code = `
        a = let(
          x = 10,
          y = 20,
          z = x < y ? x : y,
          w = sin(z) * cos(z)
        ) w * 2;
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });
  
  describe('Member Access and Indexing', () => {
    it('should parse member access expressions', () => {
      const code = `
        a = point.x;
        b = vector.y + vector.z;
        c = object.property.subproperty;
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse array indexing expressions', () => {
      const code = `
        a = arr[0];
        b = arr[i + j];
        c = arr[i][j];
        d = matrix[i][j][k];
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse complex indexing and member access', () => {
      const code = `
        a = objects[i].property;
        b = points[i].x + points[i].y;
        c = get_object(i).properties[j];
        d = get_objects()[i].get_property();
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });
  
  describe('Combined Complex Expressions', () => {
    it('should parse very complex expressions combining multiple features', () => {
      const code = `
        result = let(
          x = 10,
          y = 20,
          points = [for (i = [0:5]) [i, i*i]],
          sum_of_squares = [for (p = points) p[0] + p[1]],
          max_value = max([for (s = sum_of_squares) s])
        ) max_value > x + y ? 
            sin(max_value) * cos(max_value) : 
            sqrt(pow(x, 2) + pow(y, 2));
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse complex module instantiations with expressions', () => {
      const code = `
        translate([10 * sin(angle), 20 * cos(angle), 5 + sqrt(100)])
          rotate([0, atan2(10, 20), 45])
            scale([1 + min(2, 3), max(4, 5), pow(2, 3)])
              cube(size = x > y ? x : y);
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
    
    it('should parse recursive function definitions with complex expressions', () => {
      const code = `
        function factorial(n) = n <= 1 ? 1 : n * factorial(n - 1);
        
        function fibonacci(n) = n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
        
        function power(base, exp) = exp <= 0 ? 1 : base * power(base, exp - 1);
        
        function gcd(a, b) = b == 0 ? a : gcd(b, a % b);
      `;
      expect(testParse(code)).toBe(true);
      
      const tree = parseCode(code);
      expect(hasErrors(tree.rootNode)).toBe(false);
    });
  });
});
