import { OpenscadParser } from '../../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

// Set the generator type to use
const GENERATOR_TYPE: 'original' | 'modular' | 'direct' | 'visitor' = 'visitor';

describe('Sphere AST Generation', () => {
  let parser: OpenscadParser;

    beforeAll(async () => {
        parser = new OpenscadParser();
        await parser.init("./tree-sitter-openscad.wasm");
    });

    afterAll(() => {
        parser.dispose();
    });

  describe('sphere primitive', () => {
    it('should parse basic sphere with r parameter', () => {
      const code = `sphere(10);`;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const sphereNode = ast[0];
      expect(sphereNode.type).toBe('sphere');
      expect((sphereNode as any).radius).toBe(10);
    });

    it('should parse sphere with d parameter', () => {
      const code = `sphere(d=20);`;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const sphereNode = ast[0];
      expect(sphereNode.type).toBe('sphere');
      expect((sphereNode as any).diameter).toBe(20);
      // When diameter is specified, radius should not be present
      expect((sphereNode as any).radius).toBeUndefined();
    });

    it('should parse sphere with $fn parameter', () => {
      const code = `sphere(r=10, $fn=100);`;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const sphereNode = ast[0];
      expect(sphereNode.type).toBe('sphere');
      expect((sphereNode as any).radius).toBe(10);
      expect((sphereNode as any).fn).toBe(100);
    });

    it('should parse sphere with $fa and $fs parameters', () => {
      const code = `sphere(r=10, $fa=5, $fs=0.1);`;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const sphereNode = ast[0];
      expect(sphereNode.type).toBe('sphere');
      expect((sphereNode as any).radius).toBe(10);
      expect((sphereNode as any).fa).toBe(5);
      expect((sphereNode as any).fs).toBe(0.1);
    });

    it('should handle sphere with named r parameter', () => {
      const code = `sphere(r=15);`;
      const ast = parser.parseAST(code, GENERATOR_TYPE);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const sphereNode = ast[0];
      expect(sphereNode.type).toBe('sphere');
      expect((sphereNode as any).radius).toBe(15);
    });
  });
});
