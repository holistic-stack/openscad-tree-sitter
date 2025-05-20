import { OpenscadParser } from '../../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

// Set the generator type to use
const GENERATOR_TYPE: 'original' | 'modular' | 'direct' = 'modular';

describe('Primitive AST Generation', () => {
  let parser: OpenscadParser;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init();
  });

  afterAll(() => {
    parser.dispose();
  });

  describe('Polyhedron', () => {
    it('should parse a basic polyhedron with points and faces', async () => {
      const code = `
        polyhedron(
          points=[
            [0,0,0], [10,0,0], [10,10,0], [0,10,0],
            [0,0,10], [10,0,10], [10,10,10], [0,10,10]
          ],
          faces=[
            [0,1,2,3], [4,5,6,7], [0,4,7,3],
            [1,5,6,2], [0,1,5,4], [3,2,6,7]
          ]
        );
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('polyhedron');
      
      const polyhedronNode = ast[0] as any;
      expect(polyhedronNode.points).toHaveLength(8);
      expect(polyhedronNode.faces).toHaveLength(6);
    });

    it('should parse a polyhedron with convexity parameter', async () => {
      const code = `
        polyhedron(
          points=[
            [0,0,0], [10,0,0], [10,10,0], [0,10,0],
            [0,0,10], [10,0,10], [10,10,10], [0,10,10]
          ],
          faces=[
            [0,1,2,3], [4,5,6,7], [0,4,7,3],
            [1,5,6,2], [0,1,5,4], [3,2,6,7]
          ],
          convexity=2
        );
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('polyhedron');
      
      const polyhedronNode = ast[0] as any;
      expect(polyhedronNode.convexity).toBe(2);
    });
  });

  describe('2D Primitives', () => {
    it('should parse a circle with r parameter', async () => {
      const code = `circle(5);`;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('circle');
      
      const circleNode = ast[0] as any;
      expect(circleNode.r).toBe(5);
    });

    it('should parse a circle with d parameter', async () => {
      const code = `circle(d=10);`;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('circle');
      
      const circleNode = ast[0] as any;
      expect(circleNode.d).toBe(10);
      expect(circleNode.r).toBe(5);
    });

    it('should parse a square with size parameter', async () => {
      const code = `square(10);`;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('square');
      
      const squareNode = ast[0] as any;
      expect(squareNode.size).toBe(10);
    });

    it('should parse a square with size vector', async () => {
      const code = `square([10, 20]);`;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('square');
      
      const squareNode = ast[0] as any;
      expect(squareNode.size).toEqual([10, 20]);
    });

    it('should parse a square with center parameter', async () => {
      const code = `square([10, 20], center=true);`;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('square');
      
      const squareNode = ast[0] as any;
      expect(squareNode.size).toEqual([10, 20]);
      expect(squareNode.center).toBe(true);
    });

    it('should parse a polygon with points parameter', async () => {
      const code = `polygon(points=[[0,0], [10,0], [10,10], [0,10]]);`;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('polygon');
      
      const polygonNode = ast[0] as any;
      expect(polygonNode.points).toHaveLength(4);
    });

    it('should parse a polygon with paths parameter', async () => {
      const code = `
        polygon(
          points=[[0,0], [10,0], [10,10], [0,10], [5,5]],
          paths=[[0,1,2,3], [4]]
        );
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('polygon');
      
      const polygonNode = ast[0] as any;
      expect(polygonNode.points).toHaveLength(5);
      expect(polygonNode.paths).toHaveLength(2);
    });

    it('should parse a text node', async () => {
      const code = `text("Hello", size=10, font="Arial");`;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('text');
      
      const textNode = ast[0] as any;
      expect(textNode.text).toBe("Hello");
      expect(textNode.size).toBe(10);
      expect(textNode.font).toBe("Arial");
    });
  });

  describe('Extrusion Operations', () => {
    it('should parse a linear_extrude with height parameter', async () => {
      const code = `
        linear_extrude(height=10) {
          square(20);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('linear_extrude');
      
      const extrudeNode = ast[0] as any;
      expect(extrudeNode.height).toBe(10);
      expect(extrudeNode.children).toHaveLength(1);
      expect(extrudeNode.children[0].type).toBe('square');
    });

    it('should parse a linear_extrude with multiple parameters', async () => {
      const code = `
        linear_extrude(height=10, twist=90, scale=0.5, center=true) {
          square(5, center=true);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('linear_extrude');
      
      const extrudeNode = ast[0] as any;
      expect(extrudeNode.height).toBe(10);
      expect(extrudeNode.twist).toBe(90);
      expect(extrudeNode.scale).toBe(0.5);
      expect(extrudeNode.center).toBe(true);
      expect(extrudeNode.children).toHaveLength(1);
      expect(extrudeNode.children[0].type).toBe('square');
    });

    it('should parse a rotate_extrude', async () => {
      const code = `
        rotate_extrude() {
          translate([5, 0, 0]) circle(2);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('rotate_extrude');
      
      const extrudeNode = ast[0] as any;
      expect(extrudeNode.angle).toBe(360);
      expect(extrudeNode.children).toHaveLength(1);
      expect(extrudeNode.children[0].type).toBe('translate');
    });

    it('should parse a rotate_extrude with angle parameter', async () => {
      const code = `
        rotate_extrude(angle=180) {
          translate([5, 0, 0]) circle(2);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('rotate_extrude');
      
      const extrudeNode = ast[0] as any;
      expect(extrudeNode.angle).toBe(180);
      expect(extrudeNode.children).toHaveLength(1);
      expect(extrudeNode.children[0].type).toBe('translate');
    });
  });
});
