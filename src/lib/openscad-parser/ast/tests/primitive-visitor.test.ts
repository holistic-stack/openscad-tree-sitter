import { describe, it, expect, vi } from 'vitest';
import { PrimitiveVisitor } from '../visitors/primitive-visitor';
import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { getLocation } from '../utils/location-utils';

// Create a test class that extends PrimitiveVisitor to expose the private methods
class TestPrimitiveVisitor extends PrimitiveVisitor {
  public testCreateCubeNode(node: TSNode, args: ast.Parameter[]): ast.CubeNode | null {
    // @ts-ignore - Accessing private method for testing
    return this.createCubeNode(node, args);
  }
}

// Mock the TSNode for testing
const createMockNode = (text: string): TSNode => {
  const mockNode = {
    text,
    tree: {
      rootNode: {
        text
      }
    }
  } as unknown as TSNode;

  return mockNode;
};

describe('PrimitiveVisitor', () => {
  describe('createCubeNode', () => {
    it('should create a cube node with size parameter', () => {
      // Create a mock node
      const mockNode = createMockNode('cube(10);');

      // Create a mock visitor
      const visitor = new TestPrimitiveVisitor();

      // Create mock arguments
      const args: ast.Parameter[] = [
        { value: { type: 'number', value: '10' } }
      ];

      // Call the method
      const result = visitor.testCreateCubeNode(mockNode, args);

      // Verify the result
      expect(result).toBeDefined();
      expect(result?.type).toBe('cube');
      expect(result?.size).toBe(10);
      expect(result?.center).toBe(false);
    });

    it('should create a cube node with center parameter', () => {
      // Create a mock node
      const mockNode = createMockNode('cube(10, center=true);');

      // Create a mock visitor
      const visitor = new TestPrimitiveVisitor();

      // Create mock arguments
      const args: ast.Parameter[] = [
        { value: { type: 'number', value: '10' } },
        { name: 'center', value: { type: 'boolean', value: 'true' } }
      ];

      // Call the method
      const result = visitor.testCreateCubeNode(mockNode, args);

      // Verify the result
      expect(result).toBeDefined();
      expect(result?.type).toBe('cube');
      expect(result?.size).toBe(10);
      expect(result?.center).toBe(true);
    });

    it('should create a cube node with named size parameter', () => {
      // Create a mock node
      const mockNode = createMockNode('cube(size=10);');

      // Create a mock visitor
      const visitor = new TestPrimitiveVisitor();

      // Create mock arguments
      const args: ast.Parameter[] = [
        { name: 'size', value: { type: 'number', value: '10' } }
      ];

      // Call the method
      const result = visitor.testCreateCubeNode(mockNode, args);

      // Verify the result
      expect(result).toBeDefined();
      expect(result?.type).toBe('cube');
      expect(result?.size).toBe(10);
      expect(result?.center).toBe(false);
    });

    it('should create a cube node with vector size parameter', () => {
      // Create a mock node
      const mockNode = createMockNode('cube([10, 20, 30]);');

      // Create a mock visitor
      const visitor = new TestPrimitiveVisitor();

      // Create mock arguments
      const args: ast.Parameter[] = [
        { value: { type: 'vector', value: [10, 20, 30] } }
      ];

      // Call the method
      const result = visitor.testCreateCubeNode(mockNode, args);

      // Verify the result
      expect(result).toBeDefined();
      expect(result?.type).toBe('cube');
      expect(result?.size).toEqual([10, 20, 30]);
      expect(result?.center).toBe(false);
    });

    it('should create a cube node with default parameters when no arguments are provided', () => {
      // Create a mock node
      const mockNode = createMockNode('cube();');

      // Create a mock visitor
      const visitor = new TestPrimitiveVisitor();

      // Create mock arguments
      const args: ast.Parameter[] = [];

      // Call the method
      const result = visitor.testCreateCubeNode(mockNode, args);

      // Verify the result
      expect(result).toBeDefined();
      expect(result?.type).toBe('cube');
      expect(result?.size).toBe(1);
      expect(result?.center).toBe(false);
    });
  });
});
