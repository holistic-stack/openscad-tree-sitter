import { OpenscadParser } from '../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

describe('Difference AST Generation', () => {
  let parser: OpenscadParser;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init('./tree-sitter-openscad.wasm');
  });

  afterAll(() => {
    parser.dispose();
  });

  describe('difference operation', () => {
    it('should parse basic difference with multiple children', () => {
      const code = `difference() {
        cube(10, center=true);
        sphere(7);
      }`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const differenceNode = ast[0];
      expect(differenceNode.type).toBe('difference');

      // Check children
      expect((differenceNode as any).children).toHaveLength(2);
      expect((differenceNode as any).children[0].type).toBe('cube');
      expect((differenceNode as any).children[0].size).toBe(10);
      expect((differenceNode as any).children[0].center).toBe(true);

      expect((differenceNode as any).children[1].type).toBe('sphere');
      expect((differenceNode as any).children[1].r).toBe(7);
    });

    it('should parse difference with multiple subtractions', () => {
      const code = `difference() {
        cube(10, center=true);
        sphere(7);
        translate([0, 0, 10]) cylinder(h=10, r=3, center=true);
      }`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const differenceNode = ast[0];
      expect(differenceNode.type).toBe('difference');

      // Check children
      expect((differenceNode as any).children).toHaveLength(3);
      expect((differenceNode as any).children[0].type).toBe('cube');
      expect((differenceNode as any).children[0].size).toBe(10);
      expect((differenceNode as any).children[0].center).toBe(true);

      expect((differenceNode as any).children[1].type).toBe('sphere');
      expect((differenceNode as any).children[1].r).toBe(7);

      expect((differenceNode as any).children[2].type).toBe('translate');
      expect((differenceNode as any).children[2].v).toEqual([0, 0, 10]);
      expect((differenceNode as any).children[2].children[0].type).toBe('cylinder');
      expect((differenceNode as any).children[2].children[0].h).toBe(10);
      expect((differenceNode as any).children[2].children[0].r).toBe(3);
      expect((differenceNode as any).children[2].children[0].center).toBe(true);
    });

    it('should parse difference with a single child', () => {
      const code = `difference() {
        cube(10);
      }`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const differenceNode = ast[0];
      expect(differenceNode.type).toBe('difference');

      // Check children
      expect((differenceNode as any).children).toHaveLength(1);
      expect((differenceNode as any).children[0].type).toBe('cube');
      expect((differenceNode as any).children[0].size).toBe(10);
    });

    it('should parse empty difference', () => {
      const code = `difference() { }`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const differenceNode = ast[0];
      expect(differenceNode.type).toBe('difference');

      // Check children
      expect((differenceNode as any).children).toHaveLength(0);
    });
  });
});
