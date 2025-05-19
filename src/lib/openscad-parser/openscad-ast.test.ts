import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { OpenscadParser } from './openscad-parser';
import { SyntaxNode, Tree } from 'web-tree-sitter';

describe('OpenSCAD Parser - AST Generation', () => {
  let parser: OpenscadParser;
  let tree: Tree | null = null;

  beforeAll(async () => {
    parser = new OpenscadParser();
    // Assuming the WASM file is in the public directory when served
    await parser.init('/tree-sitter-openscad.wasm');
  });

  afterAll(() => {
    parser.dispose();
  });

  describe('Primitive Shapes', () => {
    describe('Cube', () => {
      it('should parse a simple cube with size parameter', () => {
        const code = 'cube(10);';
        tree = parser.parse(code);
        
        // Basic validation of the CST
        expect(tree).not.toBeNull();
        const rootNode = tree?.rootNode;
        expect(rootNode).not.toBeNull();
        
        // Verify the structure of the CST
        const cubeNode = rootNode?.descendants.find(
          node => node.type === 'call_expression' && 
                 node.firstChild?.text === 'cube'
        );
        
        expect(cubeNode).toBeDefined();
        
        // TODO: Add more specific assertions for the AST structure
        // once we implement the AST generation
      });
      
      it('should parse a cube with vector size', () => {
        const code = 'cube([10, 20, 30]);';
        tree = parser.parse(code);
        
        expect(tree).not.toBeNull();
        // TODO: Add assertions for vector size
      });
      
      it('should parse a cube with named parameters', () => {
        const code = 'cube(size = 10, center = true);';
        tree = parser.parse(code);
        
        expect(tree).not.toBeNull();
        // TODO: Add assertions for named parameters
      });
    });
  });
});
