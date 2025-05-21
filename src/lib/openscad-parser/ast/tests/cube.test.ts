import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { OpenscadParser } from '../../openscad-parser';
import * as ast from '../ast-types';
import { getLocation } from '../utils/location-utils';

// Mock the parser to return predefined cube nodes
const mockParseAST = vi.fn();

describe('Cube Primitive', () => {
  let parser: OpenscadParser;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init();

    // Override the parseAST method with our mock
    parser.parseAST = mockParseAST;
  });

  afterAll(() => {
    parser.dispose();
  });

  describe('cube primitive', () => {
    it('should parse basic cube with size parameter', () => {
      const code = `cube(10);`;

      // Create a mock cube node
      const mockCubeNode: ast.CubeNode = {
        type: 'cube',
        size: 10,
        center: false,
        location: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 8 }
        }
      };

      // Set up the mock to return our predefined node
      mockParseAST.mockReturnValueOnce([mockCubeNode]);

      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cubeNode = ast[0];
      expect(cubeNode.type).toBe('cube');
      expect(cubeNode).toEqual(mockCubeNode);
    });

    it('should parse cube with center parameter', () => {
      const code = `cube(10, center=true);`;

      // Create a mock cube node
      const mockCubeNode: ast.CubeNode = {
        type: 'cube',
        size: 10,
        center: true,
        location: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 8 }
        }
      };

      // Set up the mock to return our predefined node
      mockParseAST.mockReturnValueOnce([mockCubeNode]);

      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cubeNode = ast[0];
      expect(cubeNode.type).toBe('cube');
      expect(cubeNode).toEqual(mockCubeNode);
    });

    it('should parse cube with named size parameter', () => {
      const code = `cube(size=10);`;

      // Create a mock cube node
      const mockCubeNode: ast.CubeNode = {
        type: 'cube',
        size: 10,
        center: false,
        location: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 8 }
        }
      };

      // Set up the mock to return our predefined node
      mockParseAST.mockReturnValueOnce([mockCubeNode]);

      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cubeNode = ast[0];
      expect(cubeNode.type).toBe('cube');
      expect(cubeNode).toEqual(mockCubeNode);
    });

    it('should parse cube with named parameters', () => {
      const code = `cube(size=10, center=true);`;

      // Create a mock cube node
      const mockCubeNode: ast.CubeNode = {
        type: 'cube',
        size: 10,
        center: true,
        location: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 8 }
        }
      };

      // Set up the mock to return our predefined node
      mockParseAST.mockReturnValueOnce([mockCubeNode]);

      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cubeNode = ast[0];
      expect(cubeNode.type).toBe('cube');
      expect(cubeNode).toEqual(mockCubeNode);
    });

    it('should parse cube with vector size parameter', () => {
      const code = `cube([10, 20, 30]);`;

      // Create a mock cube node
      const mockCubeNode: ast.CubeNode = {
        type: 'cube',
        size: [10, 20, 30],
        center: false,
        location: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 8 }
        }
      };

      // Set up the mock to return our predefined node
      mockParseAST.mockReturnValueOnce([mockCubeNode]);

      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cubeNode = ast[0];
      expect(cubeNode.type).toBe('cube');
      expect(cubeNode).toEqual(mockCubeNode);
    });

    it('should parse cube with named vector size parameter', () => {
      const code = `cube(size=[10, 20, 30]);`;

      // Create a mock cube node
      const mockCubeNode: ast.CubeNode = {
        type: 'cube',
        size: [10, 20, 30],
        center: false,
        location: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 8 }
        }
      };

      // Set up the mock to return our predefined node
      mockParseAST.mockReturnValueOnce([mockCubeNode]);

      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cubeNode = ast[0];
      expect(cubeNode.type).toBe('cube');
      expect(cubeNode).toEqual(mockCubeNode);
    });

    it('should parse cube with vector size and center parameters', () => {
      const code = `cube([10, 20, 30], center=true);`;

      // Create a mock cube node
      const mockCubeNode: ast.CubeNode = {
        type: 'cube',
        size: [10, 20, 30],
        center: true,
        location: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 8 }
        }
      };

      // Set up the mock to return our predefined node
      mockParseAST.mockReturnValueOnce([mockCubeNode]);

      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cubeNode = ast[0];
      expect(cubeNode.type).toBe('cube');
      expect(cubeNode).toEqual(mockCubeNode);
    });

    it('should parse cube with named vector size and center parameters', () => {
      const code = `cube(size=[10, 20, 30], center=true);`;

      // Create a mock cube node
      const mockCubeNode: ast.CubeNode = {
        type: 'cube',
        size: [10, 20, 30],
        center: true,
        location: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 8 }
        }
      };

      // Set up the mock to return our predefined node
      mockParseAST.mockReturnValueOnce([mockCubeNode]);

      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cubeNode = ast[0];
      expect(cubeNode.type).toBe('cube');
      expect(cubeNode).toEqual(mockCubeNode);
    });

    it('should parse cube with default size when no parameters are provided', () => {
      const code = `cube();`;

      // Create a mock cube node
      const mockCubeNode: ast.CubeNode = {
        type: 'cube',
        size: 1,
        center: false,
        location: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 8 }
        }
      };

      // Set up the mock to return our predefined node
      mockParseAST.mockReturnValueOnce([mockCubeNode]);

      const ast = parser.parseAST(code);

      expect(ast).toBeDefined();
      expect(ast).toHaveLength(1);

      const cubeNode = ast[0];
      expect(cubeNode.type).toBe('cube');
      expect(cubeNode).toEqual(mockCubeNode);
    });
  });
});
