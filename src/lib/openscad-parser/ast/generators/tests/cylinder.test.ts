import { OpenscadParser } from '../../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

describe('Cylinder AST Generation', () => {
  let parser: OpenscadParser;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init('./tree-sitter-openscad.wasm');
  });

  afterAll(() => {
    parser.dispose();
  });

  describe('cylinder primitive', () => {
    it('should parse basic cylinder with h and r parameters', () => {
      const code = `cylinder(h=10, r=5);`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cylinderNode = ast[0];
      expect(cylinderNode.type).toBe('cylinder');
      expect((cylinderNode as any).h).toBe(10);
      expect((cylinderNode as any).r).toBe(5);
    });

    it('should parse cylinder with h, r1, r2 parameters (cone)', () => {
      const code = `cylinder(h=10, r1=10, r2=5);`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cylinderNode = ast[0];
      expect(cylinderNode.type).toBe('cylinder');
      expect((cylinderNode as any).h).toBe(10);
      expect((cylinderNode as any).r1).toBe(10);
      expect((cylinderNode as any).r2).toBe(5);
      // When r1 and r2 are specified, r should not be present
      expect((cylinderNode as any).r).toBeUndefined();
    });

    it('should parse cylinder with d, d1, d2 parameters', () => {
      const code = `cylinder(h=10, d1=20, d2=10);`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cylinderNode = ast[0];
      expect(cylinderNode.type).toBe('cylinder');
      expect((cylinderNode as any).h).toBe(10);
      expect((cylinderNode as any).d1).toBe(20);
      expect((cylinderNode as any).d2).toBe(10);
      // When d1 and d2 are specified, r1, r2, r, and d should not be present
      expect((cylinderNode as any).r1).toBeUndefined();
      expect((cylinderNode as any).r2).toBeUndefined();
      expect((cylinderNode as any).r).toBeUndefined();
      expect((cylinderNode as any).d).toBeUndefined();
    });

    it('should parse cylinder with center parameter', () => {
      const code = `cylinder(h=10, r=5, center=true);`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cylinderNode = ast[0];
      expect(cylinderNode.type).toBe('cylinder');
      expect((cylinderNode as any).h).toBe(10);
      expect((cylinderNode as any).r).toBe(5);
      expect((cylinderNode as any).center).toBe(true);
    });

    it('should parse cylinder with $fn parameter', () => {
      const code = `cylinder(h=10, r=5, $fn=50);`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cylinderNode = ast[0];
      expect(cylinderNode.type).toBe('cylinder');
      expect((cylinderNode as any).h).toBe(10);
      expect((cylinderNode as any).r).toBe(5);
      expect((cylinderNode as any).$fn).toBe(50);
    });

    it('should handle positional parameters', () => {
      const code = `cylinder(10, 5);`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cylinderNode = ast[0];
      expect(cylinderNode.type).toBe('cylinder');
      expect((cylinderNode as any).h).toBe(10);
      expect((cylinderNode as any).r).toBe(5);
    });
  });
});
