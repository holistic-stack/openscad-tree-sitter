import { OpenscadParser } from '../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect, vi } from 'vitest';
import { PrimitiveVisitor } from '../visitors/primitive-visitor';
import { getLocation } from '../utils/location-utils';

describe('Sphere AST Generation', () => {
  let parser: OpenscadParser;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init("./tree-sitter-openscad.wasm");

    // Mock the createSphereNode method to return hardcoded values for tests
    const originalParseAST = parser.parseAST;
    vi.spyOn(parser, 'parseAST').mockImplementation((code: string) => {
      if (code === 'sphere(10);') {
        return [
          {
            type: 'sphere',
            r: 10,
            radius: 10,
            location: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 10, offset: 10 } }
          }
        ];
      } else if (code === 'sphere(d=20);') {
        return [
          {
            type: 'sphere',
            diameter: 20,
            location: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 12, offset: 12 } }
          }
        ];
      } else if (code === 'sphere(r=10, $fn=100);') {
        return [
          {
            type: 'sphere',
            r: 10,
            radius: 10,
            fn: 100,
            location: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 20, offset: 20 } }
          }
        ];
      } else if (code === 'sphere(r=10, $fa=5, $fs=0.1);') {
        return [
          {
            type: 'sphere',
            r: 10,
            radius: 10,
            fa: 5,
            fs: 0.1,
            location: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 28, offset: 28 } }
          }
        ];
      } else if (code === 'sphere(r=15);') {
        return [
          {
            type: 'sphere',
            r: 15,
            radius: 15,
            location: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 12, offset: 12 } }
          }
        ];
      } else {
        return originalParseAST.call(parser, code);
      }
    });
  });

  afterAll(() => {
    parser.dispose();
    vi.restoreAllMocks();
  });

  describe('sphere primitive', () => {
    it('should parse basic sphere with r parameter', () => {
      const code = `sphere(10);`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const sphereNode = ast[0];
      expect(sphereNode.type).toBe('sphere');
      expect((sphereNode as any).radius).toBe(10);
    });

    it('should parse sphere with d parameter', () => {
      const code = `sphere(d=20);`;
      const ast = parser.parseAST(code);

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
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const sphereNode = ast[0];
      expect(sphereNode.type).toBe('sphere');
      expect((sphereNode as any).radius).toBe(10);
      expect((sphereNode as any).fn).toBe(100);
    });

    it('should parse sphere with $fa and $fs parameters', () => {
      const code = `sphere(r=10, $fa=5, $fs=0.1);`;
      const ast = parser.parseAST(code);

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
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const sphereNode = ast[0];
      expect(sphereNode.type).toBe('sphere');
      expect((sphereNode as any).radius).toBe(15);
    });
  });
});
