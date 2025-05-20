import { OpenscadParser } from '../../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

// Set the generator type to use
const GENERATOR_TYPE: 'original' | 'modular' | 'direct' = 'modular';

describe('Transformation AST Generation', () => {
  let parser: OpenscadParser;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init();
  });

  afterAll(() => {
    parser.dispose();
  });

  describe('Mirror Transformation', () => {
    it('should parse a mirror with vector parameter', async () => {
      const code = `mirror([1, 0, 0]) cube(10);`;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('mirror');

      const mirrorNode = ast[0] as any;
      expect(mirrorNode.v).toEqual([1, 0, 0]);
      expect(mirrorNode.children).toHaveLength(1);
      expect(mirrorNode.children[0].type).toBe('cube');
    });

    it('should parse a mirror with named v parameter', async () => {
      const code = `mirror(v=[0, 1, 0]) cube(10);`;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('mirror');

      const mirrorNode = ast[0] as any;
      expect(mirrorNode.v).toEqual([0, 1, 0]);
      expect(mirrorNode.children).toHaveLength(1);
      expect(mirrorNode.children[0].type).toBe('cube');
    });

    it('should parse a mirror with 2D vector parameter', async () => {
      const code = `mirror([1, 1]) cube(10);`;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('mirror');

      const mirrorNode = ast[0] as any;
      expect(mirrorNode.v).toEqual([1, 1, 0]); // Z should default to 0
      expect(mirrorNode.children).toHaveLength(1);
      expect(mirrorNode.children[0].type).toBe('cube');
    });
  });

  describe('Multmatrix Transformation', () => {
    it('should parse a multmatrix with matrix parameter', async () => {
      const code = `
        multmatrix([
          [1, 0, 0, 10],
          [0, 1, 0, 20],
          [0, 0, 1, 30],
          [0, 0, 0, 1]
        ]) cube(10);
      `;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('multmatrix');

      const multmatrixNode = ast[0] as any;
      expect(multmatrixNode.m).toEqual([
        [1, 0, 0, 10],
        [0, 1, 0, 20],
        [0, 0, 1, 30],
        [0, 0, 0, 1]
      ]);
      expect(multmatrixNode.children).toHaveLength(1);
      expect(multmatrixNode.children[0].type).toBe('cube');
    });

    it('should parse a multmatrix with named m parameter', async () => {
      const code = `
        multmatrix(m=[
          [1, 0, 0, 10],
          [0, 1, 0, 20],
          [0, 0, 1, 30],
          [0, 0, 0, 1]
        ]) cube(10);
      `;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('multmatrix');

      const multmatrixNode = ast[0] as any;
      expect(multmatrixNode.m).toEqual([
        [1, 0, 0, 10],
        [0, 1, 0, 20],
        [0, 0, 1, 30],
        [0, 0, 0, 1]
      ]);
      expect(multmatrixNode.children).toHaveLength(1);
      expect(multmatrixNode.children[0].type).toBe('cube');
    });
  });

  describe('Color Transformation', () => {
    it('should parse a color with name parameter', async () => {
      const code = `color("red") cube(10);`;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('color');

      const colorNode = ast[0] as any;
      expect(colorNode.c).toBe("red");
      expect(colorNode.children).toHaveLength(1);
      expect(colorNode.children[0].type).toBe('cube');
    });

    it('should parse a color with hex value', async () => {
      const code = `color("#ff0000") cube(10);`;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('color');

      const colorNode = ast[0] as any;
      expect(colorNode.c).toBe("#ff0000");
      expect(colorNode.children).toHaveLength(1);
      expect(colorNode.children[0].type).toBe('cube');
    });

    it('should parse a color with rgb vector', async () => {
      const code = `color([1, 0, 0]) cube(10);`;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('color');

      const colorNode = ast[0] as any;
      expect(colorNode.c).toEqual([1, 0, 0, 1]); // Alpha should default to 1
      expect(colorNode.children).toHaveLength(1);
      expect(colorNode.children[0].type).toBe('cube');
    });

    it('should parse a color with rgba vector', async () => {
      const code = `color([1, 0, 0, 0.5]) cube(10);`;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('color');

      const colorNode = ast[0] as any;
      expect(colorNode.c).toEqual([1, 0, 0, 0.5]);
      expect(colorNode.children).toHaveLength(1);
      expect(colorNode.children[0].type).toBe('cube');
    });

    it('should parse a color with alpha parameter', async () => {
      const code = `color("blue", 0.5) cube(10);`;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('color');

      const colorNode = ast[0] as any;
      expect(colorNode.c).toBe("blue");
      expect(colorNode.children).toHaveLength(1);
      expect(colorNode.children[0].type).toBe('cube');
    });

    it('should parse a color with named c and alpha parameters', async () => {
      const code = `color(c="green", alpha=0.7) cube(10);`;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('color');

      const colorNode = ast[0] as any;
      expect(colorNode.c).toBe("green");
      expect(colorNode.children).toHaveLength(1);
      expect(colorNode.children[0].type).toBe('cube');
    });
  });

  describe('Offset Transformation', () => {
    it('should parse an offset with r parameter', async () => {
      const code = `offset(r=2) square(10);`;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('offset');

      const offsetNode = ast[0] as any;
      expect(offsetNode.r).toBe(2);
      expect(offsetNode.delta).toBe(0);
      expect(offsetNode.chamfer).toBe(false);
      expect(offsetNode.children).toHaveLength(1);
      expect(offsetNode.children[0].type).toBe('square');
    });

    it('should parse an offset with delta parameter', async () => {
      const code = `offset(delta=2) square(10);`;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('offset');

      const offsetNode = ast[0] as any;
      expect(offsetNode.r).toBe(0);
      expect(offsetNode.delta).toBe(2);
      expect(offsetNode.chamfer).toBe(false);
      expect(offsetNode.children).toHaveLength(1);
      expect(offsetNode.children[0].type).toBe('square');
    });

    it('should parse an offset with chamfer parameter', async () => {
      const code = `offset(delta=2, chamfer=true) square(10);`;
      const ast = await parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('offset');

      const offsetNode = ast[0] as any;
      expect(offsetNode.r).toBe(0);
      expect(offsetNode.delta).toBe(2);
      expect(offsetNode.chamfer).toBe(true);
      expect(offsetNode.children).toHaveLength(1);
      expect(offsetNode.children[0].type).toBe('square');
    });
  });
});
