/**
 * @file Enhanced parser integration tests
 *
 * Tests for the enhanced OpenSCAD parser with AST generation capabilities.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser, SimpleErrorHandler } from './index.js';

describe('EnhancedOpenscadParser', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: SimpleErrorHandler;

  beforeEach(async () => {
    // Create error handler and parser
    errorHandler = new SimpleErrorHandler();
    parser = new EnhancedOpenscadParser(errorHandler);

    // Initialize the parser
    await parser.init('./tree-sitter-openscad.wasm');
  });

  afterEach(() => {
    parser.dispose();
  });

  describe('Basic functionality', () => {
    it('should initialize successfully', () => {
      expect(parser.isInitialized).toBe(true);
      expect(errorHandler.hasErrors()).toBe(false);
    });

    it('should parse simple OpenSCAD code and return CST', () => {
      const code = 'cube(10);';
      const tree = parser.parseCST(code);

      expect(tree).toBeDefined();
      expect(tree).not.toBeNull();

      const rootNode = tree!.rootNode;
      expect(rootNode.type).toBe('source_file');
      expect(rootNode.childCount).toBeGreaterThan(0);
    });

    it('should parse OpenSCAD code and return AST', () => {
      const code = 'cube(10);';
      const ast = parser.parseAST(code);

      // Should now return actual AST nodes
      expect(ast).toBeDefined();
      expect(Array.isArray(ast)).toBe(true);
      expect(ast.length).toBeGreaterThan(0);

      // First node should be a cube primitive (visitors create specific types)
      const firstNode = ast[0];
      expect(firstNode).toBeDefined();
      expect(firstNode.type).toBe('cube');
    });

    it('should handle parse method (alias for parseCST)', () => {
      const code = 'sphere(5);';
      const tree = parser.parse(code);

      expect(tree).toBeDefined();
      expect(tree).not.toBeNull();

      const rootNode = tree!.rootNode;
      expect(rootNode.type).toBe('source_file');
    });
  });

  describe('Error handling', () => {
    it('should collect error messages through error handler', () => {
      // Clear any previous messages
      errorHandler.clear();

      // Test info logging
      errorHandler.logInfo('Test info message');
      expect(errorHandler.getInfos()).toContain('Test info message');

      // Test warning logging
      errorHandler.logWarning('Test warning message');
      expect(errorHandler.getWarnings()).toContain('Test warning message');

      // Test error handling
      errorHandler.handleError('Test error message');
      expect(errorHandler.getErrors()).toContain('Test error message');
      expect(errorHandler.hasErrors()).toBe(true);
    });

    it('should handle syntax errors in code', () => {
      const invalidCode = 'cube(10;'; // Missing closing parenthesis
      const tree = parser.parseCST(invalidCode);

      expect(tree).toBeDefined();
      expect(tree).not.toBeNull();

      // The parser should still return a tree, but with error nodes
      const rootNode = tree!.rootNode;
      expect(rootNode.type).toBe('source_file');
    });
  });

  describe('Incremental parsing', () => {
    it('should support incremental updates', () => {
      const originalCode = 'cube(10);';
      const tree1 = parser.parseCST(originalCode);
      expect(tree1).not.toBeNull();

      // Update the code
      const newCode = 'cube(20);';
      const tree2 = parser.update(newCode, 5, 7, 7); // Change "10" to "20"

      expect(tree2).toBeDefined();
      expect(tree2).not.toBeNull();

      const rootNode = tree2!.rootNode;
      expect(rootNode.type).toBe('source_file');
    });
  });

  describe('Complex OpenSCAD code', () => {
    it('should parse complex nested structures', () => {
      const complexCode = `
        difference() {
          cube([20, 20, 20], center=true);
          sphere(10);
        }
      `;

      const tree = parser.parseCST(complexCode);
      expect(tree).toBeDefined();
      expect(tree).not.toBeNull();

      const rootNode = tree!.rootNode;
      expect(rootNode.type).toBe('source_file');
      expect(rootNode.childCount).toBeGreaterThan(0);
    });

    it('should parse transformations', () => {
      const transformCode = `
        translate([10, 0, 0])
        rotate([0, 0, 45])
        cube(10);
      `;

      const tree = parser.parseCST(transformCode);
      expect(tree).toBeDefined();
      expect(tree).not.toBeNull();

      const rootNode = tree!.rootNode;
      expect(rootNode.type).toBe('source_file');
    });

    it('should generate AST for complex nested structures', () => {
      const complexCode = `
        difference() {
          cube([20, 20, 20], center=true);
          sphere(10);
        }
      `;

      const ast = parser.parseAST(complexCode);
      expect(ast).toBeDefined();
      expect(Array.isArray(ast)).toBe(true);
      expect(ast.length).toBeGreaterThan(0);

      // Should have a difference CSG operation
      const firstNode = ast[0];
      expect(firstNode).toBeDefined();
      expect(firstNode.type).toBe('difference');
    });

    it('should generate AST for transformations', () => {
      const transformCode = `
        translate([10, 0, 0])
        rotate([0, 0, 45])
        cube(10);
      `;

      const ast = parser.parseAST(transformCode);
      expect(ast).toBeDefined();
      expect(Array.isArray(ast)).toBe(true);
      expect(ast.length).toBeGreaterThan(0);

      // Should have a translate transformation
      const firstNode = ast[0];
      expect(firstNode).toBeDefined();
      expect(firstNode.type).toBe('translate');
    });
  });
});
