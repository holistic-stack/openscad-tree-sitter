import { CompositeVisitor } from './composite-visitor';
import { PrimitiveVisitor } from './primitive-visitor';
import { TransformVisitor } from './transform-visitor';
import { CSGVisitor } from './csg-visitor';
import { OpenscadParser } from '../../openscad-parser';
import { Node as TSNode } from 'web-tree-sitter';
import { findDescendantOfType } from '../utils/node-utils';

describe('CompositeVisitor', () => {
  let parser: OpenscadParser;
  let visitor: CompositeVisitor;

    beforeAll(async () => {
        parser = new OpenscadParser();
        await parser.init("./tree-sitter-openscad.wasm");
    });

    afterAll(() => {
        parser.dispose();
    });

  beforeEach(() => {
    // Create a composite visitor with primitive, transform, and CSG visitors
    visitor = new CompositeVisitor([
      new PrimitiveVisitor(''),
      new TransformVisitor(''),
      new CSGVisitor('')
    ]);
  });

  describe('visitNode', () => {
    it('should delegate to the appropriate visitor for primitive shapes', () => {
      const code = 'cube(10);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitNode(moduleInstantiation);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('cube');
      expect((result as any).size).toBe(10);
    });

    it('should delegate to the appropriate visitor for transformations', () => {
      const code = 'translate([1, 2, 3]) {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitNode(moduleInstantiation);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('translate');
      expect((result as any).vector).toEqual([1, 2, 3]);
    });

    it('should delegate to the appropriate visitor for CSG operations', () => {
      const code = 'union() {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitNode(moduleInstantiation);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('union');
    });

    it('should return null if no visitor can process the node', () => {
      const code = 'unknown_function() {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitNode(moduleInstantiation);

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('visitChildren', () => {
    it('should visit all children of a node', () => {
      const code = 'cube(10); sphere(5);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Visit the root node's children
      const results = visitor.visitChildren(tree.rootNode);

      // Verify the results
      expect(results.length).toBe(2);
      expect(results[0].type).toBe('cube');
      expect(results[1].type).toBe('sphere');
    });
  });

  describe('complex scenarios', () => {
    it('should handle nested transformations', () => {
      const code = 'translate([1, 2, 3]) { rotate([30, 60, 90]) { cube(10); } }';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitNode(moduleInstantiation);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('translate');
      expect((result as any).vector).toEqual([1, 2, 3]);
      expect((result as any).children.length).toBe(1);
      expect((result as any).children[0].type).toBe('rotate');
      expect((result as any).children[0].angle).toEqual([30, 60, 90]);
      expect((result as any).children[0].children.length).toBe(1); // Our fix adds a cube child
    });

    it('should handle CSG operations with multiple children', () => {
      const code = 'union() { cube(10); sphere(5); }';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitNode(moduleInstantiation);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('union');
      expect((result as any).children.length).toBe(2); // Our fix adds both cube and sphere children
    });

    it('should handle complex combinations of operations', () => {
      const code = 'difference() { cube(20, center=true); translate([0, 0, 5]) sphere(10); }';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitNode(moduleInstantiation);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('difference');
      expect((result as any).children.length).toBe(2); // Our fix adds both cube and translate children
    });
  });
});

// Helper function to find a node of a specific type
function findNodeOfType(node: TSNode, type: string): TSNode | null {
  if (node.type === type) {
    return node;
  }

  // Special case for accessor_expression which might be a module_instantiation
  if (node.type === 'accessor_expression' && type === 'module_instantiation') {
    return node;
  }

  // Special case for expression_statement which might contain an accessor_expression
  if (node.type === 'expression_statement' && type === 'module_instantiation') {
    const expression = node.firstChild;
    if (expression) {
      const accessorExpression = findDescendantOfType(expression, 'accessor_expression');
      if (accessorExpression) {
        return accessorExpression;
      }
    }
  }

  // Special case for statement which might contain an expression_statement
  if (node.type === 'statement' && type === 'module_instantiation') {
    const expressionStatement = node.childForFieldName('expression_statement');
    if (expressionStatement) {
      return findNodeOfType(expressionStatement, type);
    }
  }

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!child) continue;

    const result = findNodeOfType(child, type);
    if (result) {
      return result;
    }
  }

  return null;
}
