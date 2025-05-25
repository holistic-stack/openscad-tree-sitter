/**
 * Test to debug the structure of the accessor_expression node
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser } from './enhanced-parser';

describe('OpenSCAD Node Types Debug', () => {
  let parser: EnhancedOpenscadParser;

  beforeEach(async () => {
    parser = new EnhancedOpenscadParser();
    await parser.init('./tree-sitter-openscad.wasm');
  });

  afterEach(() => {
    parser.dispose();
  });

  it('should print the structure of the accessor_expression node', () => {
    const code = 'sphere(10);';
    const tree = parser.parseCST(code);
    if (!tree) throw new Error('Failed to parse CST');

    // Print the tree structure
    console.log('Tree structure:');
    console.log(tree.rootNode.toString());

    // Find the accessor_expression node
    const accessorExpression = findNodeOfType(
      tree.rootNode,
      'accessor_expression'
    );
    if (!accessorExpression)
      throw new Error('Failed to find accessor_expression node');

    // Print the accessor_expression node structure
    console.log('Accessor expression node:');
    console.log(accessorExpression.toString());

    // Print the accessor_expression node fields
    console.log('Accessor expression node fields:');
    for (let i = 0; i < accessorExpression.namedChildCount; i++) {
      const child = accessorExpression.namedChild(i);
      if (child) {
        console.log(`Field ${i}: type=${child.type}, text=${child.text}`);
      }
    }

    // Print the accessor_expression node children
    console.log('Accessor expression node children:');
    for (let i = 0; i < accessorExpression.childCount; i++) {
      const child = accessorExpression.child(i);
      if (child) {
        console.log(`Child ${i}: type=${child.type}, text=${child.text}`);
      }
    }

    // Try to find the function name
    const functionName = accessorExpression.child(0);
    if (functionName) {
      console.log('Function name:', functionName.text);
    }

    // Try to find the arguments
    const arguments_ = accessorExpression.child(1);
    if (arguments_) {
      console.log('Arguments:', arguments_.text);
    }

    // Expect the test to pass
    expect(true).toBe(true);
  });
});

// Helper function to find a node of a specific type
function findNodeOfType(node: any, type: string): any {
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
