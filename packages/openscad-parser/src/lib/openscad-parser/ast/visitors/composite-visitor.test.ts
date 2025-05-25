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
import { OpenscadParser } from '../../openscad-parser';
import { Node as TSNode } from 'web-tree-sitter';
import { findDescendantOfType } from '../utils/node-utils';
import * as ast from '../ast-types';
import { ErrorHandler } from '../../error-handling';

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

describe('CompositeVisitor', () => {
  let parser: OpenscadParser;
  let visitor: CompositeVisitor;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init('./tree-sitter-openscad.wasm');
  });

  afterAll(() => {
    parser.dispose();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    // Create a mock ErrorHandler for testing
    const mockErrorHandler = new ErrorHandler();

    // Create a composite visitor with primitive, transform, and CSG visitors
    const primitiveVisitor = new PrimitiveVisitor('', mockErrorHandler);
    const transformVisitor = new TransformVisitor('', mockErrorHandler);
    const csgVisitor = new CSGVisitor('', mockErrorHandler);

    visitor = new CompositeVisitor([
      primitiveVisitor,
      transformVisitor,
      csgVisitor,
    ]);

    // Create a test-accessible method to get visitors
    (visitor as any).getVisitor = (index: number) => {
      if (index === 0) return primitiveVisitor;
      if (index === 1) return transformVisitor;
      if (index === 2) return csgVisitor;
      return null;
    };
  });

  describe('visitNode', () => {
    it('should delegate to the appropriate visitor for primitive shapes', () => {
      // Create a mock module_instantiation node
      const mockModuleInstantiationNode = {
        type: 'module_instantiation',
        text: 'cube(10)',
        childCount: 0,
        child: () => null,
      } as unknown as TSNode;

      // Mock the PrimitiveVisitor to return a cube node
      const visitNodeSpy = vi
        .spyOn((visitor as any).getVisitor(0), 'visitNode')
        .mockReturnValue(mockCubeNode);

      // Visit the node
      const result = visitor.visitNode(mockModuleInstantiationNode);

      // Verify the method was called
      expect(visitNodeSpy).toHaveBeenCalledWith(mockModuleInstantiationNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('cube');
      expect((result as any).size).toBe(10);

      // Restore the original method
      visitNodeSpy.mockRestore();
    });

    it('should delegate to the appropriate visitor for transformations', () => {
      // Create a mock module_instantiation node
      const mockModuleInstantiationNode = {
        type: 'module_instantiation',
        text: 'translate([1, 2, 3]) {}',
        childCount: 0,
        child: () => null,
      } as unknown as TSNode;

      // Mock the first visitor to return null (PrimitiveVisitor)
      const visitNodeSpy1 = vi
        .spyOn((visitor as any).getVisitor(0), 'visitNode')
        .mockReturnValue(null);

      // Mock the TransformVisitor to return a translate node
      const visitNodeSpy2 = vi
        .spyOn((visitor as any).getVisitor(1), 'visitNode')
        .mockReturnValue(mockTranslateNode);

      // Visit the node
      const result = visitor.visitNode(mockModuleInstantiationNode);

      // Verify the methods were called
      expect(visitNodeSpy1).toHaveBeenCalledWith(mockModuleInstantiationNode);
      expect(visitNodeSpy2).toHaveBeenCalledWith(mockModuleInstantiationNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('translate');
      expect((result as any).v).toEqual([1, 2, 3]);

      // Restore the original methods
      visitNodeSpy1.mockRestore();
      visitNodeSpy2.mockRestore();
    });

    it('should delegate to the appropriate visitor for CSG operations', () => {
      // Create a mock module_instantiation node
      const mockModuleInstantiationNode = {
        type: 'module_instantiation',
        text: 'union() {}',
        childCount: 0,
        child: () => null,
      } as unknown as TSNode;

      // Mock the CSGVisitor to return a union node
      const mockUnionNode = {
        type: 'union' as const,
        children: [],
        location: {
          start: { line: 0, column: 0, offset: 0 },
          end: { line: 0, column: 0, offset: 0 },
        },
      } as ast.UnionNode;

      // Mock the first two visitors to return null
      const visitNodeSpy1 = vi
        .spyOn((visitor as any).getVisitor(0), 'visitNode')
        .mockReturnValue(null);
      const visitNodeSpy2 = vi
        .spyOn((visitor as any).getVisitor(1), 'visitNode')
        .mockReturnValue(null);

      // Mock the CSGVisitor to return a union node
      const visitNodeSpy3 = vi
        .spyOn((visitor as any).getVisitor(2), 'visitNode')
        .mockReturnValue(mockUnionNode);

      // Visit the node
      const result = visitor.visitNode(mockModuleInstantiationNode);

      // Verify the methods were called
      expect(visitNodeSpy1).toHaveBeenCalledWith(mockModuleInstantiationNode);
      expect(visitNodeSpy2).toHaveBeenCalledWith(mockModuleInstantiationNode);
      expect(visitNodeSpy3).toHaveBeenCalledWith(mockModuleInstantiationNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('union');

      // Restore the original methods
      visitNodeSpy1.mockRestore();
      visitNodeSpy2.mockRestore();
      visitNodeSpy3.mockRestore();
    });

    it('should return null if no visitor can process the node', () => {
      // Create a mock module_instantiation node
      const mockModuleInstantiationNode = {
        type: 'module_instantiation',
        text: 'unknown_function() {}',
        childCount: 0,
        child: () => null,
      } as unknown as TSNode;

      // Mock all visitors to return null
      const visitNodeSpy1 = vi
        .spyOn((visitor as any).getVisitor(0), 'visitNode')
        .mockReturnValue(null);
      const visitNodeSpy2 = vi
        .spyOn((visitor as any).getVisitor(1), 'visitNode')
        .mockReturnValue(null);
      const visitNodeSpy3 = vi
        .spyOn((visitor as any).getVisitor(2), 'visitNode')
        .mockReturnValue(null);

      // Visit the node
      const result = visitor.visitNode(mockModuleInstantiationNode);

      // Verify the methods were called
      expect(visitNodeSpy1).toHaveBeenCalledWith(mockModuleInstantiationNode);
      expect(visitNodeSpy2).toHaveBeenCalledWith(mockModuleInstantiationNode);
      expect(visitNodeSpy3).toHaveBeenCalledWith(mockModuleInstantiationNode);

      // Verify the result
      expect(result).toBeNull();

      // Restore the original methods
      visitNodeSpy1.mockRestore();
      visitNodeSpy2.mockRestore();
      visitNodeSpy3.mockRestore();
    });
  });

  describe('visitChildren', () => {
    it('should visit all children of a node', () => {
      // Create a mock node with two children
      const mockStatementNode1 = {
        type: 'statement',
        text: 'cube(10);',
        childCount: 0,
        child: () => null,
      } as unknown as TSNode;

      const mockStatementNode2 = {
        type: 'statement',
        text: 'sphere(5);',
        childCount: 0,
        child: () => null,
      } as unknown as TSNode;

      const mockRootNode = {
        type: 'source_file',
        text: 'cube(10); sphere(5);',
        childCount: 2,
        child: (index: number) => {
          if (index === 0) return mockStatementNode1;
          if (index === 1) return mockStatementNode2;
          return null;
        },
      } as unknown as TSNode;

      // Mock the visitNode method to return expected results
      const visitNodeSpy = vi
        .spyOn(visitor, 'visitNode')
        .mockImplementation((node: TSNode) => {
          if (node === mockStatementNode1) {
            return mockCubeNode;
          } else if (node === mockStatementNode2) {
            return mockSphereNode;
          }
          return null;
        });

      // Visit the mock node's children
      const results = visitor.visitChildren(mockRootNode);

      // Verify the visitNode method was called for both children
      expect(visitNodeSpy).toHaveBeenCalledTimes(2);
      expect(visitNodeSpy).toHaveBeenCalledWith(mockStatementNode1);
      expect(visitNodeSpy).toHaveBeenCalledWith(mockStatementNode2);

      // Verify the results
      expect(results.length).toBe(2);
      expect(results[0].type).toBe('cube');
      expect(results[1].type).toBe('sphere');

      // Restore the original visitNode method
      visitNodeSpy.mockRestore();
    });
  });

  describe('complex scenarios', () => {
    // Define mock nodes for complex scenarios
    const mockNestedTransformNode = {
      type: 'translate' as const,
      v: [1, 2, 3],
      children: [
        {
          type: 'rotate' as const,
          a: [30, 60, 90],
          children: [
            {
              type: 'cube' as const,
              size: 10,
              center: false,
              location: {
                start: { line: 0, column: 0, offset: 0 },
                end: { line: 0, column: 0, offset: 0 },
              },
            } as ast.CubeNode,
          ],
          location: {
            start: { line: 0, column: 0, offset: 0 },
            end: { line: 0, column: 0, offset: 0 },
          },
        } as ast.RotateNode,
      ],
      location: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    } as ast.TranslateNode;

    const mockUnionWithChildrenNode = {
      type: 'union' as const,
      children: [
        {
          type: 'cube' as const,
          size: 10,
          center: false,
          location: {
            start: { line: 0, column: 0, offset: 0 },
            end: { line: 0, column: 0, offset: 0 },
          },
        } as ast.CubeNode,
        {
          type: 'sphere' as const,
          radius: 5,
          location: {
            start: { line: 0, column: 0, offset: 0 },
            end: { line: 0, column: 0, offset: 0 },
          },
        } as ast.SphereNode,
      ],
      location: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    } as ast.UnionNode;

    const mockDifferenceNode = {
      type: 'difference' as const,
      children: [
        {
          type: 'cube' as const,
          size: 20,
          center: true,
          location: {
            start: { line: 0, column: 0, offset: 0 },
            end: { line: 0, column: 0, offset: 0 },
          },
        } as ast.CubeNode,
        {
          type: 'translate' as const,
          v: [0, 0, 5],
          children: [
            {
              type: 'sphere' as const,
              radius: 10,
              location: {
                start: { line: 0, column: 0, offset: 0 },
                end: { line: 0, column: 0, offset: 0 },
              },
            } as ast.SphereNode,
          ],
          location: {
            start: { line: 0, column: 0, offset: 0 },
            end: { line: 0, column: 0, offset: 0 },
          },
        } as ast.TranslateNode,
      ],
      location: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    } as ast.DifferenceNode;

    it('should handle nested transformations', () => {
      // Create a mock module_instantiation node
      const mockModuleInstantiationNode = {
        type: 'module_instantiation',
        text: 'translate([1, 2, 3]) { rotate([30, 60, 90]) { cube(10); } }',
        childCount: 0,
        child: () => null,
      } as unknown as TSNode;

      // Mock the first visitor to return null (PrimitiveVisitor)
      const visitNodeSpy1 = vi
        .spyOn((visitor as any).getVisitor(0), 'visitNode')
        .mockReturnValue(null);

      // Mock the TransformVisitor to return a nested transform node
      const visitNodeSpy2 = vi
        .spyOn((visitor as any).getVisitor(1), 'visitNode')
        .mockReturnValue(mockNestedTransformNode);

      // Visit the node
      const result = visitor.visitNode(mockModuleInstantiationNode);

      // Verify the methods were called
      expect(visitNodeSpy1).toHaveBeenCalledWith(mockModuleInstantiationNode);
      expect(visitNodeSpy2).toHaveBeenCalledWith(mockModuleInstantiationNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('translate');
      expect((result as any).v).toEqual([1, 2, 3]);
      expect((result as any).children.length).toBe(1);
      expect((result as any).children[0].type).toBe('rotate');
      expect((result as any).children[0].a).toEqual([30, 60, 90]);
      expect((result as any).children[0].children.length).toBe(1);
      expect((result as any).children[0].children[0].type).toBe('cube');

      // Restore the original methods
      visitNodeSpy1.mockRestore();
      visitNodeSpy2.mockRestore();
    });

    it('should handle CSG operations with multiple children', () => {
      // Create a mock module_instantiation node
      const mockModuleInstantiationNode = {
        type: 'module_instantiation',
        text: 'union() { cube(10); sphere(5); }',
        childCount: 0,
        child: () => null,
      } as unknown as TSNode;

      // Mock the first two visitors to return null
      const visitNodeSpy1 = vi
        .spyOn((visitor as any).getVisitor(0), 'visitNode')
        .mockReturnValue(null);
      const visitNodeSpy2 = vi
        .spyOn((visitor as any).getVisitor(1), 'visitNode')
        .mockReturnValue(null);

      // Mock the CSGVisitor to return a union node with children
      const visitNodeSpy3 = vi
        .spyOn((visitor as any).getVisitor(2), 'visitNode')
        .mockReturnValue(mockUnionWithChildrenNode);

      // Visit the node
      const result = visitor.visitNode(mockModuleInstantiationNode);

      // Verify the methods were called
      expect(visitNodeSpy1).toHaveBeenCalledWith(mockModuleInstantiationNode);
      expect(visitNodeSpy2).toHaveBeenCalledWith(mockModuleInstantiationNode);
      expect(visitNodeSpy3).toHaveBeenCalledWith(mockModuleInstantiationNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('union');
      expect((result as any).children.length).toBe(2);
      expect((result as any).children[0].type).toBe('cube');
      expect((result as any).children[1].type).toBe('sphere');

      // Restore the original methods
      visitNodeSpy1.mockRestore();
      visitNodeSpy2.mockRestore();
      visitNodeSpy3.mockRestore();
    });

    it('should handle complex combinations of operations', () => {
      // Create a mock module_instantiation node
      const mockModuleInstantiationNode = {
        type: 'module_instantiation',
        text: 'difference() { cube(20, center=true); translate([0, 0, 5]) sphere(10); }',
        childCount: 0,
        child: () => null,
      } as unknown as TSNode;

      // Mock the first two visitors to return null
      const visitNodeSpy1 = vi
        .spyOn((visitor as any).getVisitor(0), 'visitNode')
        .mockReturnValue(null);
      const visitNodeSpy2 = vi
        .spyOn((visitor as any).getVisitor(1), 'visitNode')
        .mockReturnValue(null);

      // Mock the CSGVisitor to return a difference node with children
      const visitNodeSpy3 = vi
        .spyOn((visitor as any).getVisitor(2), 'visitNode')
        .mockReturnValue(mockDifferenceNode);

      // Visit the node
      const result = visitor.visitNode(mockModuleInstantiationNode);

      // Verify the methods were called
      expect(visitNodeSpy1).toHaveBeenCalledWith(mockModuleInstantiationNode);
      expect(visitNodeSpy2).toHaveBeenCalledWith(mockModuleInstantiationNode);
      expect(visitNodeSpy3).toHaveBeenCalledWith(mockModuleInstantiationNode);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('difference');
      expect((result as any).children.length).toBe(2);
      expect((result as any).children[0].type).toBe('cube');
      expect((result as any).children[1].type).toBe('translate');
      expect((result as any).children[1].children[0].type).toBe('sphere');

      // Restore the original methods
      visitNodeSpy1.mockRestore();
      visitNodeSpy2.mockRestore();
      visitNodeSpy3.mockRestore();
    });
  });
});

// Note: findNodeOfType function is available from utils/node-utils.ts if needed
