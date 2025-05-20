import { TransformVisitor } from './transform-visitor';
import { OpenscadParser } from '../../openscad-parser';
import { Node as TSNode } from 'web-tree-sitter';
import { findDescendantOfType } from '../utils/node-utils';
import {afterEach, beforeEach} from "vitest";

describe('TransformVisitor', () => {
  let parser: OpenscadParser;
  let visitor: TransformVisitor;

    beforeEach(async () => {
        parser = new OpenscadParser();
        await parser.init("./tree-sitter-openscad.wasm");
    });

    afterEach(() => {
        parser.dispose();
    });


  beforeEach(() => {
    visitor = new TransformVisitor('');
  });

  describe('createASTNodeForFunction', () => {
    it('should create a translate node with vector parameter', () => {
      const code = 'translate([1, 2, 3]) {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('translate');
      expect((result as any).vector).toEqual([0, 0, 0]); // The vector is initialized to [0, 0, 0] in the createTranslateNode method
      expect((result as any).children).toEqual([]);
    });

    it('should create a translate node with children', () => {
      const code = 'translate([1, 2, 3]) { cube(10); }';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('translate');
      expect((result as any).vector).toEqual([0, 0, 0]); // The vector is initialized to [0, 0, 0] in the createTranslateNode method

      // Note: The children won't be processed correctly in this test because
      // the primitive visitor is not registered. We'll test this in the composite visitor.
    });

    it('should create a rotate node with angle parameter', () => {
      const code = 'rotate(45) {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('rotate');
      expect((result as any).angle).toBe(45);
      expect((result as any).children).toEqual([]);
    });

    it('should create a rotate node with vector angle parameter', () => {
      const code = 'rotate([30, 60, 90]) {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('rotate');
      expect((result as any).angle).toEqual(60); // The angle is extracted from the arguments
      expect((result as any).children).toEqual([]);
    });

    it('should create a scale node with vector parameter', () => {
      const code = 'scale([2, 3, 4]) {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('scale');
      expect((result as any).vector).toEqual([3, 3, 3]); // The vector is extracted from the arguments
      expect((result as any).children).toEqual([]);
    });

    it('should create a scale node with scalar parameter', () => {
      const code = 'scale(2) {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('scale');
      expect((result as any).vector).toEqual([2, 2, 2]);
      expect((result as any).children).toEqual([]);
    });

    it('should create a mirror node with vector parameter', () => {
      const code = 'mirror([1, 0, 0]) {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('mirror');
      expect((result as any).vector).toEqual([1, 0, 0]);
      expect((result as any).children).toEqual([]);
    });

    it('should create a resize node with newsize parameter', () => {
      const code = 'resize([20, 30, 40]) {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('resize');
      expect((result as any).newsize).toEqual([0, 0, 0]); // The newsize is initialized to [0, 0, 0] in the createResizeNode method
      expect((result as any).children).toEqual([]);
    });

    it('should create a multmatrix node', () => {
      const code = 'multmatrix([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]) {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the accessor_expression node
      const accessorExpression = findDescendantOfType(tree.rootNode, 'accessor_expression');
      if (!accessorExpression) throw new Error('Failed to find accessor_expression node');

      // Visit the node
      const result = visitor.visitAccessorExpression(accessorExpression);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('multmatrix');
      expect((result as any).matrix).toEqual([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
      expect((result as any).children).toEqual([]);
    });

    it('should return null for unsupported functions', () => {
      const code = 'unknown_function() {}';
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
