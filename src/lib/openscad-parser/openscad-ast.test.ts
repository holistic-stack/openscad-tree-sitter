import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { OpenscadParser } from './openscad-parser';
import { Tree } from 'web-tree-sitter';

describe('OpenSCAD Parser - AST Generation', () => {
  let osParser: OpenscadParser;
  let tree: Tree | null;

  beforeAll(async () => {
    osParser = new OpenscadParser();
    await osParser.init('/tree-sitter-openscad.wasm');
  });

  afterAll(() => {
    osParser.dispose();
  });

  function findDescendantNode(node: any | null, predicate: (n: any) => boolean): any | undefined {
    if (!node) return undefined;
    if (predicate(node)) return node;
    for (const child of node.children) {
      const found = findDescendantNode(child, predicate);
      if (found) return found;
    }
    return undefined;
  }

  describe('Primitive Shapes', () => {
    describe('Cube', () => {
      it('should parse a simple cube with size parameter', () => {
        const code = 'cube(5);';
        tree = osParser.parse(code);
        
        expect(tree).not.toBeNull();
        const rootNode = tree?.rootNode;
        expect(rootNode).not.toBeNull();
        
        const cubeNode = findDescendantNode(rootNode, 
          (n) => n.type === 'module_instantiation' && 
                 n.childForFieldName('name')?.firstChild?.type === 'identifier' && 
                 n.childForFieldName('name')?.firstChild?.text === 'cube'
        );
        
        expect(cubeNode).toBeDefined();
      });
      
      it('should parse a cube with vector size', () => {
        const code = 'cube([10, 20, 30]);';
        tree = osParser.parse(code);
        
        expect(tree).not.toBeNull();
        const rootNode = tree?.rootNode;
        expect(rootNode).not.toBeNull();
        
        const cubeNode = findDescendantNode(rootNode, 
          (n) => n.type === 'module_instantiation' && 
                 n.childForFieldName('name')?.firstChild?.type === 'identifier' && 
                 n.childForFieldName('name')?.firstChild?.text === 'cube'
        );
        expect(cubeNode).toBeDefined();
        
        // TODO: Add assertions for vector size
      });
      
      it('should parse a cube with named parameters', () => {
        const code = 'cube(size = 10, center = true);';
        tree = osParser.parse(code);
        
        expect(tree).not.toBeNull();
        const rootNode = tree?.rootNode;
        expect(rootNode).not.toBeNull();
        
        const cubeNode = findDescendantNode(rootNode, 
          (n) => n.type === 'module_instantiation' && 
                 n.childForFieldName('name')?.firstChild?.type === 'identifier' && 
                 n.childForFieldName('name')?.firstChild?.text === 'cube'
        );
        expect(cubeNode).toBeDefined();
        
        // TODO: Add assertions for named parameters
      });
    });
  });
});
