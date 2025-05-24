import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { Parser } from 'web-tree-sitter';
import { OpenscadParser } from '../../src/lib/openscad-parser/openscad-parser';
import { VariableVisitor } from '../../src/lib/openscad-parser/ast/visitors/variable-visitor';
import { initializeParser } from '../../src/lib/openscad-parser/parser-initializer';

// Test cases for VariableVisitor
describe('VariableVisitor', () => {
  let parser: OpenscadParser;
  let treeSitterParser: Parser;
  let visitor: VariableVisitor;

  beforeAll(async () => {
    // Initialize the WebAssembly parser once before all tests
    await initializeParser();
  });

  beforeEach(async () => {
    // Create a new parser instance before each test
    parser = new OpenscadParser();
    await parser.init();
    treeSitterParser = new Parser();
  });

  afterEach(() => {
    parser.dispose();
    treeSitterParser.delete();
  });

  const createVisitor = (source: string): VariableVisitor => {
    return new VariableVisitor(source);
  };

  // Helper function to parse code and get the AST
  const parseCode = async (code: string) => {
    const tree = await parser.parse(code);
    if (!tree?.rootNode) {
      throw new Error('Failed to parse code');
    }
    visitor = createVisitor(code);
    return tree.rootNode;
  };

  describe('Special Variables', () => {
    it('should handle $fn special variable assignment', async () => {
      const code = '$fn = 32;';
      const node = await parseCode(code);
      const result = visitor.visitAssignmentStatement(node);
      
      expect(result).toEqual({
        type: 'specialVariableAssignment',
        variable: '$fn',
        value: 32,
        location: expect.any(Object)
      });
    });

    it('should handle $fa special variable assignment', async () => {
      const code = '$fa = 6;';
      const node = await parseCode(code);
      const result = visitor.visitAssignmentStatement(node);
      
      expect(result).toEqual({
        type: 'specialVariableAssignment',
        variable: '$fa',
        value: 6,
        location: expect.any(Object)
      });
    });

    it('should handle $fs special variable assignment', async () => {
      const code = '$fs = 1;';
      const node = await parseCode(code);
      const result = visitor.visitAssignmentStatement(node);
      
      expect(result).toEqual({
        type: 'specialVariableAssignment',
        variable: '$fs',
        value: 1,
        location: expect.any(Object)
      });
    });

    it('should handle $t special variable assignment', async () => {
      const code = '$t = 0.5;';
      const node = await parseCode(code);
      const result = visitor.visitAssignmentStatement(node);
      
      expect(result).toEqual({
        type: 'specialVariableAssignment',
        variable: '$t',
        value: 0.5,
        location: expect.any(Object)
      });
    });

    it('should handle $vpr special variable assignment', async () => {
      const code = '$vpr = [30, 0, 45];';
      const node = await parseCode(code);
      const result = visitor.visitAssignmentStatement(node);
      
      expect(result).toEqual({
        type: 'specialVariableAssignment',
        variable: '$vpr',
        value: [30, 0, 45],
        location: expect.any(Object)
      });
    });
  });

  describe('Regular Variables', () => {
    it('should handle simple number assignment', async () => {
      const code = 'x = 10;';
      const node = await parseCode(code);
      const result = visitor.visitAssignmentStatement(node);
      
      expect(result).toEqual({
        type: 'assignment',
        variable: 'x',
        value: {
          type: 'number',
          value: 10,
          location: expect.any(Object)
        },
        location: expect.any(Object)
      });
    });

    it('should handle string assignment', async () => {
      const code = 'name = "test";';
      const node = await parseCode(code);
      const result = visitor.visitAssignmentStatement(node);
      
      expect(result).toEqual({
        type: 'assignment',
        variable: 'name',
        value: {
          type: 'string',
          value: 'test',
          location: expect.any(Object)
        },
        location: expect.any(Object)
      });
    });

    it('should handle boolean assignment', async () => {
      const code = 'flag = true;';
      const node = await parseCode(code);
      const result = visitor.visitAssignmentStatement(node);
      
      expect(result).toEqual({
        type: 'assignment',
        variable: 'flag',
        value: {
          type: 'boolean',
          value: true,
          location: expect.any(Object)
        },
        location: expect.any(Object)
      });
    });
  });

  describe('Expressions', () => {
    it('should handle binary expressions', async () => {
      const code = 'x = 10 + 5;';
      const node = await parseCode(code);
      const result = visitor.visitAssignmentStatement(node);
      
      expect(result).toEqual({
        type: 'assignment',
        variable: 'x',
        value: {
          type: 'binaryExpression',
          operator: '+',
          left: {
            type: 'number',
            value: 10,
            location: expect.any(Object)
          },
          right: {
            type: 'number',
            value: 5,
            location: expect.any(Object)
          },
          location: expect.any(Object)
        },
        location: expect.any(Object)
      });
    });

    it('should handle nested expressions', async () => {
      const code = 'x = (10 + 5) * 2;';
      const node = await parseCode(code);
      const result = visitor.visitAssignmentStatement(node);
      
      expect(result).toEqual({
        type: 'assignment',
        variable: 'x',
        value: {
          type: 'binaryExpression',
          operator: '*',
          left: {
            type: 'binaryExpression',
            operator: '+',
            left: {
              type: 'number',
              value: 10,
              location: expect.any(Object)
            },
            right: {
              type: 'number',
              value: 5,
              location: expect.any(Object)
            },
            location: expect.any(Object)
          },
          right: {
            type: 'number',
            value: 2,
            location: expect.any(Object)
          },
          location: expect.any(Object)
        },
        location: expect.any(Object)
      });
    });

    it('should handle unary expressions', async () => {
      const code = 'x = -10;';
      const node = await parseCode(code);
      const result = visitor.visitAssignmentStatement(node);
      
      expect(result).toEqual({
        type: 'assignment',
        variable: 'x',
        value: {
          type: 'unaryExpression',
          operator: '-',
          operand: {
            type: 'number',
            value: 10,
            location: expect.any(Object)
          },
          location: expect.any(Object)
        },
        location: expect.any(Object)
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid special variable assignment', async () => {
      const code = '$fn = "invalid";';
      const node = await parseCode(code);
      
      expect(() => visitor.visitAssignmentStatement(node)).toThrow(
        '$fn requires a numeric value'
      );
    });

    it('should throw error for invalid vector assignment', async () => {
      const code = '$vpr = [1, 2];';
      const node = await parseCode(code);
      
      expect(() => visitor.visitAssignmentStatement(node)).toThrow(
        '$vpr requires a 3D vector'
      );
    });

    it('should throw error for unsupported special variable', async () => {
      const code = '$invalid = 10;';
      const node = await parseCode(code);
      
      expect(() => visitor.visitAssignmentStatement(node)).toThrow(
        'Unhandled special variable: $invalid'
      );
    });
  });
});
