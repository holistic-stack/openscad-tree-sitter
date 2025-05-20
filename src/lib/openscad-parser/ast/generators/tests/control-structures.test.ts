import { OpenscadParser } from '../../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

// Set the generator type to use
const GENERATOR_TYPE: 'original' | 'modular' | 'direct' = 'direct';

describe('Control Structure AST Generation', () => {
  let parser: OpenscadParser;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init();
  });

  afterAll(() => {
    parser.dispose();
  });

  describe('Conditional Expression', () => {
    it('should parse a simple conditional expression', async () => {
      const code = `
        x = true ? 10 : 20;
        cube(x);
      `;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      // We expect two statements: the assignment and the cube
      expect(ast).toHaveLength(2);

      // Check the assignment statement
      const assignmentNode = ast[0] as any;
      expect(assignmentNode.type).toBe('assignment');
      expect(assignmentNode.name).toBe('x');
      expect(assignmentNode.value).toBeDefined();
      expect(assignmentNode.value.type).toBe('expression');
      expect(assignmentNode.value.expressionType).toBe('conditional');

      // Check the conditional expression
      const conditionalExpr = assignmentNode.value;
      expect(conditionalExpr.condition).toBeDefined();
      expect(conditionalExpr.thenBranch).toBeDefined();
      expect(conditionalExpr.elseBranch).toBeDefined();
    });

    it('should parse a nested conditional expression', async () => {
      const code = `
        x = 5;
        result = x < 0 ? "negative" : x == 0 ? "zero" : "positive";
      `;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      // We expect two statements: the assignments
      expect(ast).toHaveLength(2);

      // Check the second assignment statement
      const assignmentNode = ast[1] as any;
      expect(assignmentNode.type).toBe('assignment');
      expect(assignmentNode.name).toBe('result');
      expect(assignmentNode.value).toBeDefined();
      expect(assignmentNode.value.type).toBe('expression');
      expect(assignmentNode.value.expressionType).toBe('conditional');

      // Check the conditional expression
      const conditionalExpr = assignmentNode.value;
      expect(conditionalExpr.condition).toBeDefined();
      expect(conditionalExpr.thenBranch).toBeDefined();
      expect(conditionalExpr.elseBranch).toBeDefined();

      // The else branch should be another conditional expression
      expect(conditionalExpr.elseBranch.expressionType).toBe('conditional');
    });
  });

  describe('If Statement', () => {
    it('should parse a simple if statement', async () => {
      const code = `
        if (true) {
          cube(10);
        }
      `;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

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
      const ast = parser.parseAST(code, GENERATOR_TYPE);

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
      const ast = parser.parseAST(code, GENERATOR_TYPE);

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
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('for_loop');

      const forNode = ast[0] as any;
      expect(forNode.variables).toBeDefined();
      expect(forNode.variables).toHaveLength(1);
      expect(forNode.variables[0].variable).toBe('i');
      expect(Array.isArray(forNode.variables[0].range)).toBe(true);
      expect(forNode.variables[0].range).toHaveLength(2);
      expect(forNode.variables[0].range[0]).toBe(0);
      expect(forNode.variables[0].range[1]).toBe(5);
      expect(forNode.body).toHaveLength(1);
      expect(forNode.body[0].type).toBe('translate');
    });

    it('should parse a for loop with step', async () => {
      const code = `
        for (i = [0:2:10]) {
          translate([i*10, 0, 0]) cube(5);
        }
      `;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('for_loop');

      const forNode = ast[0] as any;
      expect(forNode.variables).toBeDefined();
      expect(forNode.variables).toHaveLength(1);
      expect(forNode.variables[0].variable).toBe('i');
      expect(Array.isArray(forNode.variables[0].range)).toBe(true);
      expect(forNode.variables[0].range).toHaveLength(3);
      expect(forNode.variables[0].range[0]).toBe(0);
      expect(forNode.variables[0].range[1]).toBe(2);
      expect(forNode.variables[0].range[2]).toBe(10);
      expect(forNode.variables[0].step).toBe(2);
      expect(forNode.body).toHaveLength(1);
      expect(forNode.body[0].type).toBe('translate');
    });

    it('should parse a for loop with array', async () => {
      const code = `
        for (i = [10, 20, 30, 40]) {
          translate([i, 0, 0]) cube(5);
        }
      `;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('for_loop');

      const forNode = ast[0] as any;
      expect(forNode.variables).toBeDefined();
      expect(forNode.variables).toHaveLength(1);
      expect(forNode.variables[0].variable).toBe('i');
      expect(forNode.variables[0].range).toBeDefined();
      expect(forNode.body).toHaveLength(1);
      expect(forNode.body[0].type).toBe('translate');
    });

    it('should parse a for loop with multiple variables', async () => {
      const code = `
        for (i = [0:5], j = [0:5]) {
          translate([i*10, j*10, 0]) cube(5);
        }
      `;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('for_loop');

      const forNode = ast[0] as any;
      expect(forNode.variables).toBeDefined();
      expect(forNode.variables).toHaveLength(2);

      // Check first variable
      expect(forNode.variables[0].variable).toBe('i');
      expect(Array.isArray(forNode.variables[0].range)).toBe(true);
      expect(forNode.variables[0].range).toHaveLength(2);
      expect(forNode.variables[0].range[0]).toBe(0);
      expect(forNode.variables[0].range[1]).toBe(5);

      // Check second variable
      expect(forNode.variables[1].variable).toBe('j');
      expect(Array.isArray(forNode.variables[1].range)).toBe(true);
      expect(forNode.variables[1].range).toHaveLength(2);
      expect(forNode.variables[1].range[0]).toBe(0);
      expect(forNode.variables[1].range[1]).toBe(5);

      expect(forNode.body).toHaveLength(1);
      expect(forNode.body[0].type).toBe('translate');
    });
  });

  describe('Each Statement', () => {
    it('should parse an each statement with array', async () => {
      const code = `
        points = [[10, 0, 0], [0, 10, 0], [0, 0, 10]];
        for (p = [each points]) {
          translate(p) cube(5);
        }
      `;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      // We expect two statements: the assignment and the for loop
      expect(ast).toHaveLength(2);

      // Check the for loop
      const forNode = ast[1] as any;
      expect(forNode.type).toBe('for_loop');
      expect(forNode.variables).toBeDefined();
      expect(forNode.variables).toHaveLength(1);
      expect(forNode.variables[0].variable).toBe('p');

      // The range should contain an each expression
      const range = forNode.variables[0].range;
      expect(range).toBeDefined();
      expect(range.type).toBe('expression');

      // Check the body
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
      const ast = parser.parseAST(code, GENERATOR_TYPE);

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
      const ast = parser.parseAST(code, GENERATOR_TYPE);

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

    it('should parse nested let expressions', async () => {
      const code = `
        let (x = 10) {
          let (y = x * 2) {
            translate([x, y, 0]) cube(5);
          }
        }
      `;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('let');

      const outerLetNode = ast[0] as any;
      expect(outerLetNode.assignments).toBeDefined();
      expect(outerLetNode.assignments.x).toBe(10);
      expect(outerLetNode.body).toHaveLength(1);

      // Check the nested let expression
      const innerLetNode = outerLetNode.body[0];
      expect(innerLetNode.type).toBe('let');
      expect(innerLetNode.assignments).toBeDefined();
      expect(innerLetNode.assignments.y).toBeDefined();
      expect(innerLetNode.body).toHaveLength(1);
      expect(innerLetNode.body[0].type).toBe('translate');
    });
  });
});
