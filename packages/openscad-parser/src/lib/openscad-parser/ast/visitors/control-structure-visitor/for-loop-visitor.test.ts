/**
 * Tests for the ForLoopVisitor implementation
 *
 * @module lib/openscad-parser/ast/visitors/control-structure-visitor/for-loop-visitor.test
 */

import { OpenscadParser } from '../../../openscad-parser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as ast from '../../ast-types';
import { ControlStructureVisitor } from '../control-structure-visitor';
import { printNodeStructure } from '../../utils/debug-utils';
import { ErrorHandler } from '../../../error-handling';

describe('ForLoopVisitor', () => {
  let parser: OpenscadParser;
  let errorHandler: ErrorHandler;
  let visitor: ControlStructureVisitor;

  beforeEach(async () => {
    parser = new OpenscadParser();
    await parser.init('./tree-sitter-openscad.wasm');
    errorHandler = new ErrorHandler();
    visitor = new ControlStructureVisitor('', errorHandler);
  });

  afterEach(() => {
    parser.dispose();
    vi.clearAllMocks();
  });

  describe('visitForStatement', () => {
    it('should parse a basic for loop', () => {
      const code = `for (i = [0:5]) { cube(10); }`;
      const tree = parser.parse(code);
      const rootNode = tree!.rootNode;

      // Find the for statement node
      const forNode = rootNode.namedChildren[0];
      expect(forNode!.type).toBe('statement');

      // Log the node structure
      console.log('For Node Structure:');
      printNodeStructure(forNode!, 0, 5, 10);

      // Get the actual for_statement node
      const actualForNode = forNode!.namedChild(0);
      expect(actualForNode?.type).toBe('for_statement');

      // Visit the for statement node
      const result = visitor.visitForStatement(actualForNode!);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('for_loop');
      expect(result?.variables).toBeDefined();
      expect(result?.variables.length).toBe(1);
      expect(result?.variables[0].variable).toBe('i');

      // Check the range
      const range = result?.variables[0].range;
      if (Array.isArray(range)) {
        expect(range[0]).toBe(0);
        expect(range[1]).toBe(5);
      } else {
        // If it's an expression, check the value
        expect(range).toBeDefined();
      }

      expect(result?.body).toBeDefined();
      expect(result?.body.length).toBeGreaterThan(0);
    });

    it('should parse a for loop with step', () => {
      const code = `for (i = [0:0.5:5]) { cube(10); }`;
      const tree = parser.parse(code);
      const rootNode = tree!.rootNode;

      // Find the for statement node
      const forNode = rootNode.namedChildren[0];
      expect(forNode!.type).toBe('statement');

      // Get the actual for_statement node
      const actualForNode = forNode!.namedChild(0);
      expect(actualForNode?.type).toBe('for_statement');

      // Visit the for statement node
      const result = visitor.visitForStatement(actualForNode!);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('for_loop');
      expect(result?.variables).toBeDefined();
      expect(result?.variables.length).toBe(1);
      expect(result?.variables[0].variable).toBe('i');

      // Check the range and step
      const range = result?.variables[0].range;
      if (Array.isArray(range)) {
        expect(range[0]).toBe(0);
        expect(range[1]).toBe(5);
      } else {
        // If it's an expression, check the value
        expect(range).toBeDefined();
      }

      expect(result?.variables[0].step).toBeDefined();
      expect(result?.variables[0].step).toBe(0.5);

      expect(result?.body).toBeDefined();
      expect(result?.body.length).toBeGreaterThan(0);
    });

    it('should parse a for loop with multiple variables', () => {
      const code = `for (i = [0:5], j = [0:5]) { cube(10); }`;
      const tree = parser.parse(code);
      const rootNode = tree!.rootNode;

      // Find the for statement node
      const forNode = rootNode.namedChildren[0];
      expect(forNode!.type).toBe('statement');

      // Get the actual for_statement node
      const actualForNode = forNode!.namedChild(0);
      expect(actualForNode?.type).toBe('for_statement');

      // Visit the for statement node
      const result = visitor.visitForStatement(actualForNode!);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('for_loop');
      expect(result?.variables).toBeDefined();
      expect(result?.variables.length).toBe(2);

      // Check first variable
      expect(result?.variables[0].variable).toBe('i');
      const range1 = result?.variables[0].range;
      if (Array.isArray(range1)) {
        expect(range1[0]).toBe(0);
        expect(range1[1]).toBe(5);
      } else {
        // If it's an expression, check the value
        expect(range1).toBeDefined();
      }

      // Check second variable
      expect(result?.variables[1].variable).toBe('j');
      const range2 = result?.variables[1].range;
      if (Array.isArray(range2)) {
        expect(range2[0]).toBe(0);
        expect(range2[1]).toBe(5);
      } else {
        // If it's an expression, check the value
        expect(range2).toBeDefined();
      }

      expect(result?.body).toBeDefined();
      expect(result?.body.length).toBeGreaterThan(0);
    });

    it('should handle complex expressions in for loops', () => {
      const code = `for (i = [0:len(v)-1]) { cube(10); }`;
      const tree = parser.parse(code);
      const rootNode = tree!.rootNode;

      // Find the for statement node
      const forNode = rootNode.namedChildren[0];
      expect(forNode!.type).toBe('statement');

      // Get the actual for_statement node
      const actualForNode = forNode!.namedChild(0);
      expect(actualForNode?.type).toBe('for_statement');

      // Visit the for statement node
      const result = visitor.visitForStatement(actualForNode!);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('for_loop');
      expect(result?.variables).toBeDefined();
      expect(result?.variables.length).toBe(1);
      expect(result?.variables[0].variable).toBe('i');

      // The range should be an expression or a vector
      expect(result?.variables[0].range).toBeDefined();

      expect(result?.body).toBeDefined();
      expect(result?.body.length).toBeGreaterThan(0);
    });
  });
});
