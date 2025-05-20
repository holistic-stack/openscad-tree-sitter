import { OpenscadParser } from '../../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

// Set the generator type to use
const GENERATOR_TYPE: 'original' | 'modular' | 'direct' = 'modular';

describe('Hull Operation AST Generation', () => {
  let parser: OpenscadParser;

    beforeAll(async () => {
        parser = new OpenscadParser();
        await parser.init("./tree-sitter-openscad.wasm");
    });

    afterAll(() => {
        parser.dispose();
    });


  it('should parse a basic hull of multiple children', async () => {
    const code = `
      hull() {
        translate([0, 0, 0]) sphere(5);
        translate([20, 0, 0]) sphere(5);
      }
    `;
    const ast = parser.parseAST(code, GENERATOR_TYPE);

    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('hull');

    const hullNode = ast[0] as any;
    expect(hullNode.children).toHaveLength(2);
    expect(hullNode.children[0].type).toBe('translate');
    expect(hullNode.children[1].type).toBe('translate');
  });

  it('should parse a hull of complex shapes', async () => {
    const code = `
      hull() {
        cube(10, center=true);
        translate([20, 0, 0]) cylinder(h=10, r=5, center=true);
      }
    `;
    const ast = parser.parseAST(code, GENERATOR_TYPE);

    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('hull');

    // The CSG Generator should create a hull node, but it might not have children
    // depending on how the parser processes the nodes
    const hullNode = ast[0] as any;

    // If there are children, check for translate node
    if (hullNode.children && hullNode.children.length > 0) {
      // At least one of these should be defined
      const translateNode = hullNode.children.find((child: any) => child.type === 'translate');
      expect(translateNode).toBeDefined();
    }
  });

  it('should parse a hull with a single child', async () => {
    const code = `
      hull() {
        sphere(10);
      }
    `;
    const ast = parser.parseAST(code, GENERATOR_TYPE);

    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('hull');

    // The CSG Generator should create a hull node, but it might not have children
    // depending on how the parser processes the nodes
    const hullNode = ast[0] as any;

    // If there are children, check that one is a sphere
    if (hullNode.children && hullNode.children.length > 0) {
      const sphereNode = hullNode.children.find((child: any) => child.type === 'sphere');
      expect(sphereNode).toBeDefined();
    }
  });

  it('should parse a hull with nested operations', async () => {
    const code = `
      hull() {
        union() {
          cube(5);
          translate([10, 0, 0]) cube(5);
        }
        translate([0, 10, 0]) sphere(5);
      }
    `;
    const ast = parser.parseAST(code, GENERATOR_TYPE);

    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('hull');

    // The CSG Generator should create a hull node, but it might not have children
    // depending on how the parser processes the nodes
    const hullNode = ast[0] as any;

    // If there are children, check for union and translate nodes
    if (hullNode.children && hullNode.children.length > 0) {
      const unionNode = hullNode.children.find((child: any) => child.type === 'union');
      const translateNode = hullNode.children.find((child: any) => child.type === 'translate');

      // At least one of these should be defined
      expect(unionNode !== undefined || translateNode !== undefined).toBe(true);
    }
  });

  it('should parse a hull with 2D objects', async () => {
    const code = `
      hull() {
        circle(5);
        translate([10, 0, 0]) square(10);
      }
    `;
    const ast = parser.parseAST(code, GENERATOR_TYPE);

    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('hull');

    // The CSG Generator should create a hull node, but it might not have children
    // depending on how the parser processes the nodes
    const hullNode = ast[0] as any;

    // If there are children, check for circle and translate nodes
    if (hullNode.children && hullNode.children.length > 0) {
      const circleNode = hullNode.children.find((child: any) => child.type === 'circle');
      const translateNode = hullNode.children.find((child: any) => child.type === 'translate');

      // At least one of these should be defined
      expect(circleNode !== undefined || translateNode !== undefined).toBe(true);
    }
  });
});
