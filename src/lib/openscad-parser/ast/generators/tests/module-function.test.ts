import { OpenscadParser } from '../../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

// Set the generator type to use
const GENERATOR_TYPE: 'original' | 'modular' | 'direct' = 'direct';

describe('Module and Function AST Generation', () => {
  let parser: OpenscadParser;

    beforeAll(async () => {
        parser = new OpenscadParser();
        await parser.init("./tree-sitter-openscad.wasm");
    });

    afterAll(() => {
        parser.dispose();
    });



  describe('Module Definition', () => {
    it('should parse a basic module without parameters', async () => {
      const code = `
        module mycube() {
          cube(10);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('module_definition');

      const moduleNode = ast[0] as any;
      expect(moduleNode.name).toBe('mycube');
      expect(moduleNode.parameters).toHaveLength(0);
      expect(moduleNode.body).toHaveLength(1);
      expect(moduleNode.body[0].type).toBe('cube');
    });

    it('should parse a module with positional parameters', async () => {
      const code = `
        module mycube(size) {
          cube(size);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('module_definition');

      const moduleNode = ast[0] as any;
      expect(moduleNode.name).toBe('mycube');
      expect(moduleNode.parameters).toHaveLength(1);
      expect(moduleNode.parameters[0].name).toBe('size');
      expect(moduleNode.parameters[0].defaultValue).toBeUndefined();
      expect(moduleNode.body).toHaveLength(1);
      expect(moduleNode.body[0].type).toBe('cube');
    });

    it('should parse a module with named parameters and default values', async () => {
      const code = `
        module mycube(size=10, center=false) {
          cube(size, center=center);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('module_definition');

      const moduleNode = ast[0] as any;
      expect(moduleNode.name).toBe('mycube');
      expect(moduleNode.parameters).toHaveLength(2);
      expect(moduleNode.parameters[0].name).toBe('size');
      expect(moduleNode.parameters[0].defaultValue).toBe(10);
      expect(moduleNode.parameters[1].name).toBe('center');
      expect(moduleNode.parameters[1].defaultValue).toBe(false);
      expect(moduleNode.body).toHaveLength(1);
      expect(moduleNode.body[0].type).toBe('cube');
    });

    it('should parse a module with special variables', async () => {
      const code = `
        module mysphere(r=10) {
          sphere(r=r, $fn=$fn);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('module_definition');

      const moduleNode = ast[0] as any;
      expect(moduleNode.name).toBe('mysphere');
      expect(moduleNode.parameters).toHaveLength(1);
      expect(moduleNode.parameters[0].name).toBe('r');
      expect(moduleNode.parameters[0].defaultValue).toBe(10);
      expect(moduleNode.body).toHaveLength(1);
      expect(moduleNode.body[0].type).toBe('sphere');
    });

    it('should parse a module with children', async () => {
      const code = `
        module wrapper() {
          translate([0, 0, 10]) children();
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('module_definition');

      const moduleNode = ast[0] as any;
      expect(moduleNode.name).toBe('wrapper');
      expect(moduleNode.parameters).toHaveLength(0);
      expect(moduleNode.body).toHaveLength(1);
      expect(moduleNode.body[0].type).toBe('translate');
      expect(moduleNode.body[0].children).toHaveLength(1);
      expect(moduleNode.body[0].children[0].type).toBe('children');
    });

    it('should parse a module with child indexing', async () => {
      const code = `
        module select_child() {
          children(0);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('module_definition');

      const moduleNode = ast[0] as any;
      expect(moduleNode.name).toBe('select_child');
      expect(moduleNode.parameters).toHaveLength(0);
      expect(moduleNode.body).toHaveLength(1);
      expect(moduleNode.body[0].type).toBe('children');
      expect(moduleNode.body[0].index).toBe(0);
    });
  });

  describe('Function Definition', () => {
    it('should parse a basic function with parameters', async () => {
      const code = `
        function add(a, b) = a + b;
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('function_definition');

      const functionNode = ast[0] as any;
      expect(functionNode.name).toBe('add');
      expect(functionNode.parameters).toHaveLength(2);
      expect(functionNode.parameters[0].name).toBe('a');
      expect(functionNode.parameters[1].name).toBe('b');
      expect(functionNode.expression).toBeDefined();
      expect(functionNode.expression.type).toBe('expression');
    });

    it('should parse a function with default parameter values', async () => {
      const code = `
        function add(a=0, b=0) = a + b;
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('function_definition');

      const functionNode = ast[0] as any;
      expect(functionNode.name).toBe('add');
      expect(functionNode.parameters).toHaveLength(2);
      expect(functionNode.parameters[0].name).toBe('a');
      expect(functionNode.parameters[0].defaultValue).toBe(0);
      expect(functionNode.parameters[1].name).toBe('b');
      expect(functionNode.parameters[1].defaultValue).toBe(0);
      expect(functionNode.expression).toBeDefined();
      expect(functionNode.expression.type).toBe('expression');
    });
  });

  describe('Module Instantiation', () => {
    it('should parse a basic module instantiation', async () => {
      const code = `
        mycube();
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('module_instantiation');

      const moduleInstNode = ast[0] as any;
      expect(moduleInstNode.name).toBe('mycube');
      expect(moduleInstNode.arguments).toHaveLength(0);
      expect(moduleInstNode.children).toHaveLength(0);
    });

    it('should parse a module instantiation with positional parameters', async () => {
      const code = `
        mycube(20);
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('module_instantiation');

      const moduleInstNode = ast[0] as any;
      expect(moduleInstNode.name).toBe('mycube');
      expect(moduleInstNode.arguments).toHaveLength(1);
      expect(moduleInstNode.arguments[0].value).toBe(20);
      expect(moduleInstNode.children).toHaveLength(0);
    });

    it('should parse a module instantiation with named parameters', async () => {
      const code = `
        mycube(size=20, center=true);
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('module_instantiation');

      const moduleInstNode = ast[0] as any;
      expect(moduleInstNode.name).toBe('mycube');
      expect(moduleInstNode.arguments).toHaveLength(2);
      expect(moduleInstNode.arguments[0].name).toBe('size');
      expect(moduleInstNode.arguments[0].value).toBe(20);
      expect(moduleInstNode.arguments[1].name).toBe('center');
      expect(moduleInstNode.arguments[1].value).toBe(true);
      expect(moduleInstNode.children).toHaveLength(0);
    });

    it('should parse a module instantiation with children', async () => {
      const code = `
        wrapper() {
          cube(10);
        }
      `;
      const ast = await parser.parseToAST(code, GENERATOR_TYPE);

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('module_instantiation');

      const moduleInstNode = ast[0] as any;
      expect(moduleInstNode.name).toBe('wrapper');
      expect(moduleInstNode.arguments).toHaveLength(0);
      expect(moduleInstNode.children).toHaveLength(1);
      expect(moduleInstNode.children[0].type).toBe('cube');
    });
  });
});
