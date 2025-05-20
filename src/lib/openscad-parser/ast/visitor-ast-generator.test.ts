import { VisitorASTGenerator } from './visitor-ast-generator';
import { OpenscadParser } from '../openscad-parser';

describe('VisitorASTGenerator', () => {
  let parser: OpenscadParser;

    beforeAll(async () => {
        parser = new OpenscadParser();
        await parser.init("./tree-sitter-openscad.wasm");
    });

    afterAll(() => {
        parser.dispose();
    });



  describe('generate', () => {
    it('should generate an AST for a simple cube', () => {
      const code = 'cube(10);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      const generator = new VisitorASTGenerator(tree, code, parser.language);
      const ast = generator.generate();

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('cube');
      expect((ast[0] as any).size).toBe(10);
      expect((ast[0] as any).center).toBe(false);
    });

    it('should generate an AST for a simple sphere', () => {
      const code = 'sphere(5);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      const generator = new VisitorASTGenerator(tree, code, parser.language);
      const ast = generator.generate();

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('sphere');
      expect((ast[0] as any).radius).toBe(5);
    });

    it('should generate an AST for a simple cylinder', () => {
      const code = 'cylinder(h=10, r=5);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      const generator = new VisitorASTGenerator(tree, code, parser.language);
      const ast = generator.generate();

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('cylinder');
      expect((ast[0] as any).height).toBe(10);
      expect((ast[0] as any).radius1).toBe(5);
      expect((ast[0] as any).radius2).toBe(5);
      expect((ast[0] as any).center).toBe(false);
    });

    it('should generate an AST for a simple translate', () => {
      const code = 'translate([1, 2, 3]) cube(10);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      const generator = new VisitorASTGenerator(tree, code, parser.language);
      const ast = generator.generate();

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('translate');
      expect((ast[0] as any).vector).toEqual([1, 2, 3]);
      expect((ast[0] as any).children).toHaveLength(1);
      expect((ast[0] as any).children[0].type).toBe('cube');
      expect((ast[0] as any).children[0].size).toBe(10);
    });

    it('should generate an AST for a simple rotate', () => {
      const code = 'rotate([30, 60, 90]) cube(10);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      const generator = new VisitorASTGenerator(tree, code, parser.language);
      const ast = generator.generate();

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('rotate');
      expect((ast[0] as any).angle).toEqual([30, 60, 90]);
      expect((ast[0] as any).children).toHaveLength(1);
      expect((ast[0] as any).children[0].type).toBe('cube');
      expect((ast[0] as any).children[0].size).toBe(10);
    });

    it('should generate an AST for a simple scale', () => {
      const code = 'scale([2, 3, 4]) cube(10);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      const generator = new VisitorASTGenerator(tree, code, parser.language);
      const ast = generator.generate();

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('scale');
      expect((ast[0] as any).vector).toEqual([2, 3, 4]);
      expect((ast[0] as any).children).toHaveLength(1);
      expect((ast[0] as any).children[0].type).toBe('cube');
      expect((ast[0] as any).children[0].size).toBe(10);
    });

    it('should generate an AST for a simple union', () => {
      const code = 'union() { cube(10); sphere(5); }';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      const generator = new VisitorASTGenerator(tree, code, parser.language);
      const ast = generator.generate();

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('union');
      expect((ast[0] as any).children).toHaveLength(2);
      expect((ast[0] as any).children[0].type).toBe('cube');
      expect((ast[0] as any).children[0].size).toBe(10);
      expect((ast[0] as any).children[1].type).toBe('sphere');
      expect((ast[0] as any).children[1].radius).toBe(5);
    });

    it('should generate an AST for a simple difference', () => {
      const code = 'difference() { cube(20, center=true); sphere(10); }';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      const generator = new VisitorASTGenerator(tree, code, parser.language);
      const ast = generator.generate();

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('difference');
      expect((ast[0] as any).children).toHaveLength(2);
      expect((ast[0] as any).children[0].type).toBe('cube');
      expect((ast[0] as any).children[0].size).toBe(20);
      expect((ast[0] as any).children[0].center).toBe(true);
      expect((ast[0] as any).children[1].type).toBe('sphere');
      expect((ast[0] as any).children[1].radius).toBe(10);
    });

    it('should generate an AST for a simple intersection', () => {
      const code = 'intersection() { cube(20, center=true); sphere(15); }';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      const generator = new VisitorASTGenerator(tree, code, parser.language);
      const ast = generator.generate();

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('intersection');
      expect((ast[0] as any).children).toHaveLength(2);
      expect((ast[0] as any).children[0].type).toBe('cube');
      expect((ast[0] as any).children[0].size).toBe(20);
      expect((ast[0] as any).children[0].center).toBe(true);
      expect((ast[0] as any).children[1].type).toBe('sphere');
      expect((ast[0] as any).children[1].radius).toBe(15);
    });

    it('should generate an AST for multiple statements', () => {
      const code = 'cube(10); sphere(5);';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      const generator = new VisitorASTGenerator(tree, code);
      const ast = generator.generate();

      expect(ast).toHaveLength(2);
      expect(ast[0].type).toBe('cube');
      expect((ast[0] as any).size).toBe(10);
      expect(ast[1].type).toBe('sphere');
      expect((ast[1] as any).radius).toBe(5);
    });

    it('should generate an AST for complex nested operations', () => {
      const code = 'difference() { cube(20, center=true); translate([0, 0, 5]) { rotate([0, 0, 45]) cube(10, center=true); } }';
      const tree = parser.parseCST(code);
      if (!tree) throw new Error('Failed to parse CST');

      const generator = new VisitorASTGenerator(tree, code);
      const ast = generator.generate();

      expect(ast).toHaveLength(1);
      expect(ast[0].type).toBe('difference');
      expect((ast[0] as any).children).toHaveLength(2);
      expect((ast[0] as any).children[0].type).toBe('cube');
      expect((ast[0] as any).children[0].size).toBe(20);
      expect((ast[0] as any).children[0].center).toBe(true);
      expect((ast[0] as any).children[1].type).toBe('translate');
      expect((ast[0] as any).children[1].vector).toEqual([0, 0, 5]);
      expect((ast[0] as any).children[1].children).toHaveLength(1);
      expect((ast[0] as any).children[1].children[0].type).toBe('rotate');
      expect((ast[0] as any).children[1].children[0].angle).toEqual([0, 0, 45]);
      expect((ast[0] as any).children[1].children[0].children).toHaveLength(1);
      expect((ast[0] as any).children[1].children[0].children[0].type).toBe('cube');
      expect((ast[0] as any).children[1].children[0].children[0].size).toBe(10);
      expect((ast[0] as any).children[1].children[0].children[0].center).toBe(true);
    });
  });
});
