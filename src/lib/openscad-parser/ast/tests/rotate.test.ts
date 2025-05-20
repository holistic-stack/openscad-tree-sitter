import { OpenscadParser } from '../../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

describe('Rotate AST Generation', () => {
  let parser: OpenscadParser;

    beforeAll(async () => {
        parser = new OpenscadParser();
        await parser.init("./tree-sitter-openscad.wasm");
    });

    afterAll(() => {
        parser.dispose();
    });


  describe('rotate transformation', () => {
    it('should parse rotate with scalar angle (z-axis)', () => {
      const code = `rotate(45) cube(10);`;
      const ast = parser.parseAST(code, 'direct');

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const rotateNode = ast[0];
      expect(rotateNode.type).toBe('rotate');
      expect((rotateNode as any).a).toBe(45);
      expect((rotateNode as any).v).toEqual([0, 0, 1]); // Default z-axis

      // Check children
      expect((rotateNode as any).children).toHaveLength(1);
      expect((rotateNode as any).children[0].type).toBe('cube');
      expect((rotateNode as any).children[0].size).toBe(10);
    });

    it('should parse rotate with vector angles [x,y,z]', () => {
      const code = `rotate([45, 0, 90]) cube(10);`;
      const ast = parser.parseAST(code, 'direct');

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const rotateNode = ast[0];
      expect(rotateNode.type).toBe('rotate');
      expect((rotateNode as any).a).toEqual([45, 0, 90]);

      // Check children
      expect((rotateNode as any).children).toHaveLength(1);
      expect((rotateNode as any).children[0].type).toBe('cube');
      expect((rotateNode as any).children[0].size).toBe(10);
    });

    it('should parse rotate with a and v parameters (axis-angle)', () => {
      const code = `rotate(a=45, v=[0, 0, 1]) cube(10);`;
      const ast = parser.parseAST(code, 'direct');

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const rotateNode = ast[0];
      expect(rotateNode.type).toBe('rotate');
      expect((rotateNode as any).a).toBe(45);
      expect((rotateNode as any).v).toEqual([0, 0, 1]);

      // Check children
      expect((rotateNode as any).children).toHaveLength(1);
      expect((rotateNode as any).children[0].type).toBe('cube');
      expect((rotateNode as any).children[0].size).toBe(10);
    });

    it('should parse rotate with child block', () => {
      const code = `rotate([45, 0, 90]) {
        cube(10);
        sphere(5);
      }`;
      const ast = parser.parseAST(code, 'direct');

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const rotateNode = ast[0];
      expect(rotateNode.type).toBe('rotate');
      expect((rotateNode as any).a).toEqual([45, 0, 90]);

      // Check children
      expect((rotateNode as any).children).toHaveLength(2);
      expect((rotateNode as any).children[0].type).toBe('cube');
      expect((rotateNode as any).children[0].size).toBe(10);
      expect((rotateNode as any).children[1].type).toBe('sphere');
      expect((rotateNode as any).children[1].r).toBe(5);
    });
  });
});
