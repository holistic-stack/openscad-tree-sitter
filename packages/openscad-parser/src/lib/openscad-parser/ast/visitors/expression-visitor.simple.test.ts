import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OpenscadParser } from '../../openscad-parser';
import { ExpressionVisitor } from './expression-visitor';
import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';

describe('ExpressionVisitor Simple Tests', () => {
  let parser: OpenscadParser;
  let visitor: ExpressionVisitor;

  beforeEach(async () => {
    parser = new OpenscadParser();
    await parser.init('./tree-sitter-openscad.wasm');
    visitor = new ExpressionVisitor('');
  });

  afterEach(() => {
    parser.dispose();
  });

  it('should handle a simple binary expression', async () => {
    const code = 'a = 1 + 2;';
    const tree = parser.parseCST(code);
    expect(tree).not.toBeNull();

    // Log the structure of the tree
    console.log('Root node type:', tree!.rootNode.type);
    console.log('Root node text:', tree!.rootNode.text);
    console.log('Root node child count:', tree!.rootNode.childCount);

    // Log the structure of each child
    for (let i = 0; i < tree!.rootNode.childCount; i++) {
      const child = tree!.rootNode.child(i);
      if (!child) continue;

      console.log(`Child ${i} type:`, child.type);
      console.log(`Child ${i} text:`, child.text);
      console.log(`Child ${i} child count:`, child.childCount);

      // Log the structure of each grandchild
      for (let j = 0; j < child.childCount; j++) {
        const grandchild = child.child(j);
        if (!grandchild) continue;

        console.log(`Grandchild ${i}.${j} type:`, grandchild.type);
        console.log(`Grandchild ${i}.${j} text:`, grandchild.text);
        console.log(`Grandchild ${i}.${j} child count:`, grandchild.childCount);
      }
    }

    // Find the assignment statement node
    const assignmentNode = findNodeOfType(
      tree!.rootNode,
      'assignment_statement'
    );
    expect(assignmentNode).not.toBeNull();

    if (assignmentNode) {
      // Find the expression node within the assignment
      const expressionNode = findNodeOfType(assignmentNode, 'expression');
      expect(expressionNode).not.toBeNull();

      if (expressionNode) {
        // Process the expression
        const result = visitor.visitExpression(expressionNode);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('expression');
        expect((result as ast.ExpressionNode).expressionType).toBe('binary');

        const binaryExpr = result as ast.BinaryExpressionNode;
        expect(binaryExpr.operator).toBe('+');
        expect(binaryExpr.left.expressionType).toBe('literal');
        expect((binaryExpr.left as ast.LiteralNode).value).toBe(1);
        expect(binaryExpr.right.expressionType).toBe('literal');
        expect((binaryExpr.right as ast.LiteralNode).value).toBe(2);
      }
    }
  });

  // Helper function to find a node of a specific type in the tree
  function findNodeOfType(node: TSNode, type: string): TSNode | null {
    if (node.type === type) {
      return node;
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
});
