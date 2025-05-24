import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { OpenscadParser } from '../../openscad-parser';
import * as ast from '../ast-types';

describe('CompositeVisitor with Real Parser', () => {
  let parser: OpenscadParser;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init('./tree-sitter-openscad.wasm');
  });

  afterAll(() => {
    parser.dispose();
  });

  describe('parseAST with real parser', () => {
    it('should parse a simple cube', async () => {
      const code = 'cube(10);';
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cubeNode = ast[0];
      expect(cubeNode.type).toBe('cube');
      expect(cubeNode).toHaveProperty('location');
    });

    it('should parse OpenSCAD code and return AST nodes', async () => {
      const code = 'sphere(5);';
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      // The parser returns AST nodes with type information
      const node = ast[0];
      expect(node).toHaveProperty('location');
    });

    it('should parse code with multiple statements', async () => {
      const code = `
        cube(10);
        sphere(5);
        cylinder(h=10, r=5);
      `;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast.length).toBeGreaterThan(0);

      // Check that we have AST nodes
      ast.forEach(node => {
        expect(node).toHaveProperty('location');
      });
    });
  });
});
