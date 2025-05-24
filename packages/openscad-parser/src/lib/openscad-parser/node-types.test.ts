/**
 * Test to print the node types in the OpenSCAD language
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OpenscadParser } from './openscad-parser';

describe('OpenSCAD Node Types', () => {
  let parser: OpenscadParser;

  beforeEach(async () => {
    parser = new OpenscadParser();
    await parser.init('./tree-sitter-openscad.wasm');
  });

  afterEach(() => {
    parser.dispose();
  });

  it('should print the node types in a simple OpenSCAD program', () => {
    const code = 'cube(10); sphere(5); cylinder(h=10, r=5);';
    const tree = parser.parseCST(code);
    if (!tree) throw new Error('Failed to parse CST');

    // Print the tree structure
    console.log('Tree structure:');
    console.log(tree.rootNode.toString());

    // Print the node types
    const cursor = tree.rootNode.walk();

    const nodeTypes = new Set<string>();

    // Go to the first child
    cursor.gotoFirstChild();

    do {
      nodeTypes.add(cursor.nodeType);

      // Try to go to the first child
      if (cursor.gotoFirstChild()) {
        // If successful, continue with the loop
        continue;
      }

      // If no first child, try to go to the next sibling
      if (cursor.gotoNextSibling()) {
        // If successful, continue with the loop
        continue;
      }

      // If no next sibling, go to the parent and then to the next sibling
      let foundNextNode = false;
      while (!foundNextNode) {
        if (!cursor.gotoParent()) {
          // If we can't go to the parent, we're done
          break;
        }

        if (cursor.gotoNextSibling()) {
          // If we found a next sibling, continue with the loop
          foundNextNode = true;
        }
      }

      if (!foundNextNode) {
        // If we didn't find a next node, we're done
        break;
      }
    } while (true);

    // Print the node types
    console.log('Node types:');
    console.log(Array.from(nodeTypes).sort().join('\n'));

    // We expect to find some node types
    expect(nodeTypes.size).toBeGreaterThan(0);
  });
});
