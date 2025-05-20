import { OpenscadParser } from '../../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

// Set the generator type to use
const GENERATOR_TYPE: 'original' | 'modular' | 'direct' = 'modular';

describe('Control Structure AST Generation', () => {
  let parser: OpenscadParser;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init();
  });

  afterAll(() => {
    parser.dispose();
  });

  describe('If Statement', () => {
    it('should parse a simple if statement', async () => {
      const code = `
        if (true) {
          cube(10);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('if');
      
      const ifNode = ast[0] as any;
      expect(ifNode.condition).toBeDefined();
      expect(ifNode.thenBranch).toHaveLength(1);
      expect(ifNode.thenBranch[0].type).toBe('cube');
      expect(ifNode.elseBranch).toBeUndefined();
    });

    it('should parse an if-else statement', async () => {
      const code = `
        if (false) {
          cube(10);
        } else {
          sphere(5);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('if');
      
      const ifNode = ast[0] as any;
      expect(ifNode.condition).toBeDefined();
      expect(ifNode.thenBranch).toHaveLength(1);
      expect(ifNode.thenBranch[0].type).toBe('cube');
      expect(ifNode.elseBranch).toHaveLength(1);
      expect(ifNode.elseBranch[0].type).toBe('sphere');
    });

    it('should parse an if-else-if statement', async () => {
      const code = `
        if (x < 0) {
          cube(10);
        } else if (x == 0) {
          sphere(5);
        } else {
          cylinder(h=10, r=2);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('if');
      
      const ifNode = ast[0] as any;
      expect(ifNode.condition).toBeDefined();
      expect(ifNode.thenBranch).toHaveLength(1);
      expect(ifNode.thenBranch[0].type).toBe('cube');
      expect(ifNode.elseBranch).toHaveLength(1);
      expect(ifNode.elseBranch[0].type).toBe('if');
      
      const elseIfNode = ifNode.elseBranch[0];
      expect(elseIfNode.condition).toBeDefined();
      expect(elseIfNode.thenBranch).toHaveLength(1);
      expect(elseIfNode.thenBranch[0].type).toBe('sphere');
      expect(elseIfNode.elseBranch).toHaveLength(1);
      expect(elseIfNode.elseBranch[0].type).toBe('cylinder');
    });
  });

  describe('For Loop', () => {
    it('should parse a simple for loop with range', async () => {
      const code = `
        for (i = [0:5]) {
          translate([i*10, 0, 0]) cube(5);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('for_loop');
      
      const forNode = ast[0] as any;
      expect(forNode.variable).toBe('i');
      expect(Array.isArray(forNode.range)).toBe(true);
      expect(forNode.range).toHaveLength(2);
      expect(forNode.range[0]).toBe(0);
      expect(forNode.range[1]).toBe(5);
      expect(forNode.body).toHaveLength(1);
      expect(forNode.body[0].type).toBe('translate');
    });

    it('should parse a for loop with step', async () => {
      const code = `
        for (i = [0:2:10]) {
          translate([i*10, 0, 0]) cube(5);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('for_loop');
      
      const forNode = ast[0] as any;
      expect(forNode.variable).toBe('i');
      expect(Array.isArray(forNode.range)).toBe(true);
      expect(forNode.range).toHaveLength(3);
      expect(forNode.range[0]).toBe(0);
      expect(forNode.range[1]).toBe(2);
      expect(forNode.range[2]).toBe(10);
      expect(forNode.step).toBe(2);
      expect(forNode.body).toHaveLength(1);
      expect(forNode.body[0].type).toBe('translate');
    });

    it('should parse a for loop with array', async () => {
      const code = `
        for (i = [10, 20, 30, 40]) {
          translate([i, 0, 0]) cube(5);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('for_loop');
      
      const forNode = ast[0] as any;
      expect(forNode.variable).toBe('i');
      expect(forNode.range).toBeDefined();
      expect(forNode.body).toHaveLength(1);
      expect(forNode.body[0].type).toBe('translate');
    });
  });

  describe('Let Expression', () => {
    it('should parse a simple let expression', async () => {
      const code = `
        let (x = 10) {
          cube(x);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('let');
      
      const letNode = ast[0] as any;
      expect(letNode.assignments).toBeDefined();
      expect(letNode.assignments.x).toBe(10);
      expect(letNode.body).toHaveLength(1);
      expect(letNode.body[0].type).toBe('cube');
    });

    it('should parse a let expression with multiple variables', async () => {
      const code = `
        let (x = 10, y = 20, z = 30) {
          translate([x, y, z]) cube(5);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);
      
      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('let');
      
      const letNode = ast[0] as any;
      expect(letNode.assignments).toBeDefined();
      expect(letNode.assignments.x).toBe(10);
      expect(letNode.assignments.y).toBe(20);
      expect(letNode.assignments.z).toBe(30);
      expect(letNode.body).toHaveLength(1);
      expect(letNode.body[0].type).toBe('translate');
    });
  });
});
