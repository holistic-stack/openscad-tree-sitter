import { PrimitiveVisitor } from './primitive-visitor';
import { OpenscadParser } from '../../openscad-parser';
import { Node as TSNode } from 'web-tree-sitter';
import { findDescendantOfType } from '../utils/node-utils';

describe('PrimitiveVisitor', () => {
  let parser: OpenscadParser;
  let visitor: PrimitiveVisitor;

    beforeAll(async () => {
        parser = new OpenscadParser();
        await parser.init("./tree-sitter-openscad.wasm");
    });

    afterAll(() => {
        parser.dispose();
    });


  beforeEach(() => {
    visitor = new PrimitiveVisitor('');
  });

  describe('createASTNodeForFunction', () => {
    it('should create a cube node with default parameters', () => {
      const code = 'cube();';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('cube');
      expect((result as any).size).toBe(1);
      expect((result as any).center).toBe(false);
    });

    it('should create a cube node with size parameter', () => {
      const code = 'cube(10);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('cube');
      expect((result as any).size).toBe(10);
      expect((result as any).center).toBe(false);
    });

    it('should create a cube node with size and center parameters', () => {
      const code = 'cube(10, center=true);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('cube');
      expect((result as any).size).toBe(10);
      expect((result as any).center).toBe(true);
    });

    it('should create a cube node with vector size', () => {
      const code = 'cube([10, 20, 30]);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('cube');
      expect((result as any).size).toEqual([10, 20, 30]);
      expect((result as any).center).toBe(false);
    });

    it('should create a sphere node with default parameters', () => {
      const code = 'sphere();';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('sphere');
      expect((result as any).radius).toBe(1);
    });

    it('should create a sphere node with radius parameter', () => {
      const code = 'sphere(5);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('sphere');
      expect((result as any).radius).toBe(5);
    });

    it('should create a sphere node with diameter parameter', () => {
      const code = 'sphere(d=10);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('sphere');
      expect((result as any).r).toBe(5);
    });

    it('should create a cylinder node with default parameters', () => {
      const code = 'cylinder();';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('cylinder');
      expect((result as any).height).toBe(1);
      expect((result as any).radius1).toBe(1);
      expect((result as any).radius2).toBe(1);
      expect((result as any).center).toBe(false);
    });

    it('should create a cylinder node with height and radius parameters', () => {
      const code = 'cylinder(h=10, r=5);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('cylinder');
      expect((result as any).height).toBe(10);
      expect((result as any).radius1).toBe(5);
      expect((result as any).radius2).toBe(5);
      expect((result as any).center).toBe(false);
    });

    it('should create a cylinder node with different top and bottom radii', () => {
      const code = 'cylinder(h=10, r1=5, r2=3);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('cylinder');
      expect((result as any).height).toBe(10);
      expect((result as any).radius1).toBe(5);
      expect((result as any).radius2).toBe(3);
      expect((result as any).center).toBe(false);
    });

    it('should create a cylinder node with diameter parameters', () => {
      const code = 'cylinder(h=10, d=10);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('cylinder');
      expect((result as any).height).toBe(10);
      expect((result as any).radius1).toBe(5);
      expect((result as any).radius2).toBe(5);
      expect((result as any).center).toBe(false);
    });

    it('should create a cylinder node with different top and bottom diameters', () => {
      const code = 'cylinder(h=10, d1=10, d2=6);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('cylinder');
      expect((result as any).height).toBe(10);
      expect((result as any).radius1).toBe(5);
      expect((result as any).radius2).toBe(3);
      expect((result as any).center).toBe(false);
    });

    it('should return null for unsupported functions', () => {
      const code = 'unknown_function();';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).toBeNull();
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
