import { CSGVisitor } from './csg-visitor';
import { OpenscadParser } from '../../openscad-parser';
import { Node as TSNode } from 'web-tree-sitter';
import { findDescendantOfType } from '../utils/node-utils';

describe('CSGVisitor', () => {
  let parser: OpenscadParser;
  let visitor: CSGVisitor;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init("./tree-sitter-openscad.wasm");
  });

  afterAll(() => {
    parser.dispose();
  });

  beforeEach(() => {
    visitor = new CSGVisitor('');
  });

  describe('createASTNodeForFunction', () => {
    it('should create a union node', () => {
      const code = 'union() {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitModuleInstantiation(moduleInstantiation);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('union');
      expect((result as any).children).toEqual([]);
    });

    it('should create a union node with children', () => {
      const code = 'union() { cube(10); sphere(5); }';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitModuleInstantiation(moduleInstantiation);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('union');

      // Note: The children won't be processed correctly in this test because
      // the primitive visitor is not registered. We'll test this in the composite visitor.
    });

    it('should create a difference node', () => {
      const code = 'difference() {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitModuleInstantiation(moduleInstantiation);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('difference');
      expect((result as any).children).toEqual([]);
    });

    it('should create an intersection node', () => {
      const code = 'intersection() {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitModuleInstantiation(moduleInstantiation);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('intersection');
      expect((result as any).children).toEqual([]);
    });

    it('should create a hull node', () => {
      const code = 'hull() {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitModuleInstantiation(moduleInstantiation);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('hull');
      expect((result as any).children).toEqual([]);
    });

    it('should create a minkowski node', () => {
      const code = 'minkowski() {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitModuleInstantiation(moduleInstantiation);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.type).toBe('minkowski');
      expect((result as any).children).toEqual([]);
    });

    it('should return null for unsupported functions', () => {
      const code = 'unknown_function() {}';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      // Find the module_instantiation node
      const moduleInstantiation = findNodeOfType(tree.rootNode, 'module_instantiation');
      if (!moduleInstantiation) throw new Error('Failed to find module_instantiation node');

      // Visit the node
      const result = visitor.visitModuleInstantiation(moduleInstantiation);

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