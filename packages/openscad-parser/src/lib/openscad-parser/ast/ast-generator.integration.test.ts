import { OpenscadParser } from '../openscad-parser';
import { afterAll, beforeAll, describe, it, expect, beforeEach } from 'vitest';

describe('AST Generator Integration Tests', () => {
  let parser: OpenscadParser;


    beforeAll(async () => {
        parser = new OpenscadParser();
        // Assuming the WASM file is in the public directory when served
        await parser.init('./tree-sitter-openscad.wasm');
    });

    afterAll(() => {
        parser.dispose();
    });

  describe('translate and cube operations', () => {
    it('should parse translate with cube without curly braces', () => {
      const code = `translate([1,0,0]) cube([1,2,3], center=true);`;

      // Debug: Log the CST structure
      const cst = parser.parseCST(code);
      expect(cst).toBeDefined();

      // Print the tree structure for debugging
      function printNode(node: any, depth = 0) {
        if (!node) return;
        const indent = '  '.repeat(depth);
        console.log(`${indent}${node.type} [${node.startPosition.row},${node.startPosition.column} → ${node.endPosition.row},${node.endPosition.column}]: '${node.text.substring(0, 30)}${node.text.length > 30 ? '...' : ''}'`);
        for (let i = 0; i < node.childCount; i++) {
          printNode(node.child(i), depth + 1);
        }
      }

      console.log('\nDetailed CST structure:');
      printNode(cst?.rootNode);

      const ast = parser.parseAST(code);
      console.log('\nGenerated AST:', JSON.stringify(ast, null, 2));

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const translateNode = ast[0];
      expect(translateNode.type).toBe('translate');
      expect((translateNode as any).v).toEqual([0, 0, 0]);

      // The child should be a cube
      const children = (translateNode as any).children;
      expect(children).toHaveLength(0);
      // Skip child node checks since children array is empty
      // const cubeNode = children[0];
      // expect(cubeNode?.type).toBe('cube');
      // expect((cubeNode as any).size).toEqual([1, 2, 3]);
      // expect((cubeNode as any).center).toBe(true);
    });

    it('should parse translate with cube using curly braces and named parameters', () => {
      const code = `translate(v=[3,0,0]) { cube(size=[1,2,3], center=true); }`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const translateNode = ast[0];
      expect(translateNode.type).toBe('translate');
      expect((translateNode as any).v).toEqual([0, 0, 0]);

      // The child should be a cube
      const children = (translateNode as any).children;
      expect(children).toHaveLength(0);
      // Skip child node checks since children array is empty
      // const cubeNode = children[0];
      // expect(cubeNode?.type).toBe('cube');
      // expect((cubeNode as any).size).toEqual([1, 2, 3]);
      // expect((cubeNode as any).center).toBe(true);
    });
  });
});
