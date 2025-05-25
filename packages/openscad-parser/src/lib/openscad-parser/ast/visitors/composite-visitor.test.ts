import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from 'vitest';
import { CompositeVisitor } from './composite-visitor';
import { PrimitiveVisitor } from './primitive-visitor';
import { TransformVisitor } from './transform-visitor';
import { CSGVisitor } from './csg-visitor';
import { OpenscadParser } from '../../../index'; // Use the minimal parser from index
import { Node as TSNode } from 'web-tree-sitter';
import { findDescendantOfType } from '../utils/node-utils';
import * as ast from '../ast-types';
// import { ErrorHandler } from '../../error-handling'; // Temporarily commented out due to build issues

// Define mock nodes for testing
const mockCubeNode: ast.CubeNode = {
  type: 'cube',
  size: 10,
  center: false,
  location: {
    start: { line: 0, column: 0, offset: 0 },
    end: { line: 0, column: 0, offset: 0 },
  },
};

const mockSphereNode: ast.SphereNode = {
  type: 'sphere',
  radius: 5,
  location: {
    start: { line: 0, column: 0, offset: 0 },
    end: { line: 0, column: 0, offset: 0 },
  },
};

const mockTranslateNode: ast.TranslateNode = {
  type: 'translate',
  v: [1, 2, 3],
  children: [],
  location: {
    start: { line: 0, column: 0, offset: 0 },
    end: { line: 0, column: 0, offset: 0 },
  },
};

// Simple mock ErrorHandler for testing
class MockErrorHandler {
  logInfo() {}
  logWarning() {}
  handleError() {}
}

describe('CompositeVisitor', () => {
  let parser: OpenscadParser;
  let visitor: CompositeVisitor;
  let errorHandler: MockErrorHandler;

  // Helper function to find module_instantiation nodes or statement nodes for testing
  function findTestableNode(node: TSNode): TSNode | null {
    // Look for module_instantiation first (for transforms and CSG operations)
    if (node.type === 'module_instantiation') {
      return node;
    }
    // Look for statement nodes (for primitive shapes like cube(10);)
    if (node.type === 'statement') {
      return node;
    }
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        const found = findTestableNode(child);
        if (found) return found;
      }
    }
    return null;
  }

  // Helper function to parse code and find testable node
  function parseAndFindTestableNode(code: string): TSNode {
    const tree = parser.parse(code);
    expect(tree).not.toBeNull();

    const testableNode = findTestableNode(tree!.rootNode);
    expect(testableNode).not.toBeNull();

    return testableNode!;
  }

  beforeEach(async () => {
    // Create a new parser instance for each test
    parser = new OpenscadParser();
    await parser.init('./tree-sitter-openscad.wasm');

    // Create a mock ErrorHandler for testing
    errorHandler = new MockErrorHandler();

    // Create a composite visitor with primitive, transform, and CSG visitors
    const primitiveVisitor = new PrimitiveVisitor('', errorHandler as any);
    const transformVisitor = new TransformVisitor('', undefined, errorHandler as any);
    const csgVisitor = new CSGVisitor('', errorHandler as any);

    visitor = new CompositeVisitor([
      primitiveVisitor,
      transformVisitor,
      csgVisitor,
    ], errorHandler as any);
  });

  afterEach(() => {
    parser.dispose();
    vi.clearAllMocks();
  });

  describe('visitNode', () => {
    it('should delegate to the appropriate visitor for primitive shapes', () => {
      // Parse real OpenSCAD code and find testable node
      const testableNode = parseAndFindTestableNode('cube(10);');

      // Visit the real node
      const result = visitor.visitNode(testableNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('cube');
    });

    it('should delegate to the appropriate visitor for transformations', () => {
      // Parse real OpenSCAD code and find testable node
      const testableNode = parseAndFindTestableNode('translate([1, 2, 3]) {}');

      // Visit the real node
      const result = visitor.visitNode(testableNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('translate');
    });

    it('should delegate to the appropriate visitor for CSG operations', () => {
      // Parse real OpenSCAD code and find testable node
      const testableNode = parseAndFindTestableNode('union() {}');

      // Visit the real node
      const result = visitor.visitNode(testableNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('union');
    });

    it('should return null if no visitor can process the node', () => {
      // Parse real OpenSCAD code with an unknown function
      const testableNode = parseAndFindTestableNode('unknown_function() {}');

      // Visit the real node
      const result = visitor.visitNode(testableNode);

      // Verify the result - should be null since no visitor handles unknown_function
      expect(result).toBeNull();
    });
  });

  describe('visitChildren', () => {
    it('should visit all children of a node', () => {
      // Parse real OpenSCAD code with multiple statements
      const code = 'cube(10); sphere(5);';
      const tree = parser.parse(code);
      expect(tree).not.toBeNull();

      // Use the root node which should have multiple children
      const rootNode = tree!.rootNode;
      expect(rootNode.childCount).toBeGreaterThan(0);

      // Visit the children
      const results = visitor.visitChildren(rootNode);

      // Verify we got some results (the exact number depends on the tree structure)
      expect(results.length).toBeGreaterThan(0);

      // Check that we have at least one cube or sphere result
      const hasExpectedTypes = results.some(result =>
        result.type === 'cube' || result.type === 'sphere'
      );
      expect(hasExpectedTypes).toBe(true);
    });
  });

  describe('complex scenarios', () => {
    it('should handle nested transformations', () => {
      // Parse real OpenSCAD code with nested transformations
      const testableNode = parseAndFindTestableNode('translate([1, 2, 3]) { cube(10); }');

      // Visit the real node
      const result = visitor.visitNode(testableNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('translate');
    });

    it('should handle CSG operations with multiple children', () => {
      // Parse real OpenSCAD code with union and multiple children
      const testableNode = parseAndFindTestableNode('union() { cube(10); sphere(5); }');

      // Visit the real node
      const result = visitor.visitNode(testableNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('union');
    });

    it('should handle complex combinations of operations', () => {
      // Parse real OpenSCAD code with difference operation
      const testableNode = parseAndFindTestableNode('difference() { cube(20); sphere(10); }');

      // Visit the real node
      const result = visitor.visitNode(testableNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('difference');
    });
  });
});

// Note: findNodeOfType function is available from utils/node-utils.ts if needed
