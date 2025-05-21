import { OpenscadParser } from '../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

describe('Union AST Generation', () => {
  let parser: OpenscadParser;

    beforeAll(async () => {
        parser = new OpenscadParser();
        await parser.init("./tree-sitter-openscad.wasm");
    });

    afterAll(() => {
        parser.dispose();
    });


  describe('union operation', () => {
    it('should parse basic union of multiple children', () => {
      const code = `union() {
        cube(10, center=true);
        translate([5, 5, 5]) sphere(5);
      }`;
      const ast = parser.parseAST(code, 'visitor');

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const unionNode = ast[0];
      expect(unionNode.type).toBe('union');

      // Check children
      expect((unionNode as any).children).toHaveLength(0);
      expect((unionNode as any).children[0].type).toBe('cube');
      expect((unionNode as any).children[0].size).toBe(10);
      expect((unionNode as any).children[0].center).toBe(true);

      expect((unionNode as any).children[1].type).toBe('translate');
      expect((unionNode as any).children[1].vector).toEqual([5, 5, 5]);
      expect((unionNode as any).children[1].children[0].type).toBe('sphere');
      expect((unionNode as any).children[1].children[0].radius).toBe(5);
    });

    it('should parse implicit union (no union keyword)', () => {
      const code = `{
        cube(10, center=true);
        translate([5, 5, 5]) sphere(5);
      }`;
      const ast = parser.parseAST(code, 'visitor');

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(2);

      // First child should be a cube
      expect(ast[0].type).toBe('cube');
      expect((ast[0] as any).size).toBe(10);
      expect((ast[0] as any).center).toBe(true);

      // Second child should be a translate
      expect(ast[1].type).toBe('translate');
      expect((ast[1] as any).vector).toEqual([5, 5, 5]);
      expect((ast[1] as any).children[0].type).toBe('sphere');
      expect((ast[1] as any).children[0].radius).toBe(5);
    });

    it('should parse union with a single child', () => {
      const code = `union() {
        cube(10);
      }`;
      const ast = parser.parseAST(code, 'visitor');

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const unionNode = ast[0];
      expect(unionNode.type).toBe('union');

      // Check children
      expect((unionNode as any).children).toHaveLength(0);
      expect((unionNode as any).children[0].type).toBe('cube');
      expect((unionNode as any).children[0].size).toBe(10);
    });

    it('should parse empty union', () => {
      const code = `union() { }`;
      const ast = parser.parseAST(code, 'visitor');

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const unionNode = ast[0];
      expect(unionNode.type).toBe('union');

      // Check children
      expect((unionNode as any).children).toHaveLength(0);
    });
  });
});
