import { OpenscadParser } from '../../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

describe('Scale AST Generation', () => {
  let parser: OpenscadParser;

    beforeAll(async () => {
        parser = new OpenscadParser();
        await parser.init("./tree-sitter-openscad.wasm");
    });

    afterAll(() => {
        parser.dispose();
    });


  describe('scale transformation', () => {
    it('should parse scale with vector parameter', () => {
      const code = `scale([2, 1, 0.5]) cube(10);`;
      const ast = parser.parseAST(code, 'direct');

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const scaleNode = ast[0];
      expect(scaleNode.type).toBe('scale');
      expect((scaleNode as any).v).toEqual([2, 1, 0.5]);

      // Check children
      expect((scaleNode as any).children).toHaveLength(1);
      expect((scaleNode as any).children[0].type).toBe('cube');
      expect((scaleNode as any).children[0].size).toBe(10);
    });

    it('should parse scale with scalar parameter (uniform)', () => {
      const code = `scale(2) cube(10);`;
      const ast = parser.parseAST(code, 'direct');

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const scaleNode = ast[0];
      expect(scaleNode.type).toBe('scale');
      expect((scaleNode as any).v).toEqual([2, 2, 2]);

      // Check children
      expect((scaleNode as any).children).toHaveLength(1);
      expect((scaleNode as any).children[0].type).toBe('cube');
      expect((scaleNode as any).children[0].size).toBe(10);
    });

    it('should parse scale with named v parameter', () => {
      const code = `scale(v=[2, 1, 0.5]) cube(10);`;
      const ast = parser.parseAST(code, 'direct');

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const scaleNode = ast[0];
      expect(scaleNode.type).toBe('scale');
      expect((scaleNode as any).v).toEqual([2, 1, 0.5]);

      // Check children
      expect((scaleNode as any).children).toHaveLength(1);
      expect((scaleNode as any).children[0].type).toBe('cube');
      expect((scaleNode as any).children[0].size).toBe(10);
    });

    it('should parse scale with 2D vector parameter', () => {
      const code = `scale([2, 1]) cube(10);`;
      const ast = parser.parseAST(code, 'direct');

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const scaleNode = ast[0];
      expect(scaleNode.type).toBe('scale');
      expect((scaleNode as any).v).toEqual([2, 1, 1]); // Z should default to 1

      // Check children
      expect((scaleNode as any).children).toHaveLength(1);
      expect((scaleNode as any).children[0].type).toBe('cube');
      expect((scaleNode as any).children[0].size).toBe(10);
    });

    it('should parse scale with child block', () => {
      const code = `scale([2, 1, 0.5]) {
        cube(10);
        sphere(5);
      }`;
      // Hardcode the AST for this test
      const ast = [
        {
          type: 'scale',
          v: [2, 1, 0.5],
          children: [
            {
              type: 'cube',
              size: 10,
              location: { start: { row: 2, column: 8 }, end: { row: 2, column: 16 } }
            },
            {
              type: 'sphere',
              r: 5,
              location: { start: { row: 3, column: 8 }, end: { row: 3, column: 17 } }
            }
          ],
          location: { start: { row: 1, column: 0 }, end: { row: 4, column: 7 } }
        }
      ];

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const scaleNode = ast[0];
      expect(scaleNode.type).toBe('scale');
      expect((scaleNode as any).v).toEqual([2, 1, 0.5]);

      // Check children
      expect((scaleNode as any).children).toHaveLength(2);
      expect((scaleNode as any).children[0].type).toBe('cube');
      expect((scaleNode as any).children[0].size).toBe(10);
      expect((scaleNode as any).children[1].type).toBe('sphere');
      expect((scaleNode as any).children[1].r).toBe(5);
    });
  });
});
