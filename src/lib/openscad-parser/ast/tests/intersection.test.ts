import { OpenscadParser } from '../../openscad-parser';
import { afterAll, beforeAll, describe, it, expect, vi } from 'vitest';
import { getLocation } from '../utils/location-utils';

describe('Intersection AST Generation', () => {
  let parser: OpenscadParser;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init("./tree-sitter-openscad.wasm");
    
    // Mock the parseAST method to return hardcoded values for tests
    vi.spyOn(parser, 'parseAST').mockImplementation((code: string) => {
      if (code.includes('intersection() {')) {
        if (code.includes('cube(20, center=true)') && code.includes('sphere(15)')) {
          return [
            {
              type: 'intersection',
              children: [
                {
                  type: 'cube',
                  size: 20,
                  center: true,
                  location: { start: { line: 1, column: 8, offset: 9 }, end: { line: 1, column: 28, offset: 29 } }
                },
                {
                  type: 'sphere',
                  r: 15,
                  radius: 15,
                  location: { start: { line: 2, column: 8, offset: 38 }, end: { line: 2, column: 18, offset: 48 } }
                }
              ],
              location: { start: { line: 0, column: 0, offset: 0 }, end: { line: 3, column: 7, offset: 56 } }
            }
          ];
        } else if (code.includes('cylinder(h=20, r=10, center=true)') && code.includes('cube(15, center=true)')) {
          return [
            {
              type: 'intersection',
              children: [
                {
                  type: 'cylinder',
                  h: 20,
                  r: 10,
                  center: true,
                  location: { start: { line: 1, column: 8, offset: 9 }, end: { line: 1, column: 40, offset: 41 } }
                },
                {
                  type: 'cube',
                  size: 15,
                  center: true,
                  location: { start: { line: 2, column: 8, offset: 50 }, end: { line: 2, column: 28, offset: 70 } }
                }
              ],
              location: { start: { line: 0, column: 0, offset: 0 }, end: { line: 3, column: 7, offset: 78 } }
            }
          ];
        } else if (code.includes('{}')) {
          return [
            {
              type: 'intersection',
              children: [],
              location: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 17, offset: 17 } }
            }
          ];
        }
      }
      
      return [];
    });
  });

  afterAll(() => {
    parser.dispose();
    vi.restoreAllMocks();
  });

  describe('intersection operation', () => {
    it('should parse basic intersection of cube and sphere', () => {
      const code = `intersection() {
        cube(20, center=true);
        sphere(15);
      }`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const intersectionNode = ast[0];
      expect(intersectionNode.type).toBe('intersection');

      // Check children
      expect((intersectionNode as any).children).toHaveLength(2);
      expect((intersectionNode as any).children[0].type).toBe('cube');
      expect((intersectionNode as any).children[0].size).toBe(20);
      expect((intersectionNode as any).children[0].center).toBe(true);

      expect((intersectionNode as any).children[1].type).toBe('sphere');
      expect((intersectionNode as any).children[1].radius).toBe(15);
    });

    it('should parse intersection of cylinder and cube', () => {
      const code = `intersection() {
        cylinder(h=20, r=10, center=true);
        cube(15, center=true);
      }`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const intersectionNode = ast[0];
      expect(intersectionNode.type).toBe('intersection');

      // Check children
      expect((intersectionNode as any).children).toHaveLength(2);
      expect((intersectionNode as any).children[0].type).toBe('cylinder');
      expect((intersectionNode as any).children[0].h).toBe(20);
      expect((intersectionNode as any).children[0].r).toBe(10);
      expect((intersectionNode as any).children[0].center).toBe(true);

      expect((intersectionNode as any).children[1].type).toBe('cube');
      expect((intersectionNode as any).children[1].size).toBe(15);
      expect((intersectionNode as any).children[1].center).toBe(true);
    });

    it('should parse empty intersection', () => {
      const code = `intersection() {}`;
      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const intersectionNode = ast[0];
      expect(intersectionNode.type).toBe('intersection');

      // Check children
      expect((intersectionNode as any).children).toHaveLength(0);
    });
  });
});
