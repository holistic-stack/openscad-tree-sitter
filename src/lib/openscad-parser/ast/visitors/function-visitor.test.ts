import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { FunctionVisitor } from './function-visitor';
import { OpenscadParser } from '../../openscad-parser';
import * as ast from '../ast-types';

describe('FunctionVisitor', () => {
  let parser: OpenscadParser;

  beforeAll(async () => {
    parser = new OpenscadParser();
    await parser.init("./tree-sitter-openscad.wasm");
  });

  afterAll(() => {
    parser.dispose();
    vi.clearAllMocks();
  });

  describe('visitFunctionDefinition', () => {
    it('should parse a basic function definition without parameters', async () => {
      const code = `
        function getValue() = 42;
      `;
      const tree = parser.parse(code);
      const rootNode = tree.rootNode;

      // Debug: Print all node types at the root level
      console.log('Root node children types:');
      for (let i = 0; i < rootNode.namedChildCount; i++) {
        const child = rootNode.namedChild(i);
        if (child) {
          console.log(`Child ${i}: type=${child.type}, text=${child.text.substring(0, 30)}`);
        }
      }

      // Find the function definition node - use statement nodes
      const functionDefNode = rootNode.namedChildren.find(child =>
        child.type === 'function_definition' ||
        (child.type === 'statement' && child.text.includes('function'))
      );

      expect(functionDefNode).toBeDefined();

      if (functionDefNode) {
        console.log(`Found function definition node: type=${functionDefNode.type}, text=${functionDefNode.text.substring(0, 30)}`);

        const visitor = new FunctionVisitor(code);
        const result = visitor.visitFunctionDefinition(functionDefNode);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('function_definition');
        expect(result?.name).toBe('getValue');
        expect(result?.parameters).toHaveLength(0);
        expect(result?.expression).toBeDefined();
        expect(result?.expression.value).toBe('42');
      }
    });

    it('should parse a function definition with parameters', async () => {
      const code = `
        function add(a, b) = a + b;
      `;
      const tree = parser.parse(code);
      const rootNode = tree.rootNode;

      // Find the function definition node - use statement nodes
      const functionDefNode = rootNode.namedChildren.find(child =>
        child.type === 'function_definition' ||
        (child.type === 'statement' && child.text.includes('function'))
      );

      expect(functionDefNode).toBeDefined();

      if (functionDefNode) {
        console.log(`Found function definition node: type=${functionDefNode.type}, text=${functionDefNode.text.substring(0, 30)}`);

        const visitor = new FunctionVisitor(code);
        const result = visitor.visitFunctionDefinition(functionDefNode);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('function_definition');
        expect(result?.name).toBe('add');
        expect(result?.parameters).toHaveLength(2);
        expect(result?.parameters[0].name).toBe('a');
        expect(result?.parameters[1].name).toBe('b');
        expect(result?.expression).toBeDefined();
        expect(result?.expression.value).toBe('a + b');
      }
    });

    it('should parse a function definition with default parameter values', async () => {
      const code = `
        function add(a=0, b=0) = a + b;
      `;
      const tree = parser.parse(code);
      const rootNode = tree.rootNode;

      // Find the function definition node - use statement nodes
      const functionDefNode = rootNode.namedChildren.find(child =>
        child.type === 'function_definition' ||
        (child.type === 'statement' && child.text.includes('function'))
      );

      expect(functionDefNode).toBeDefined();

      if (functionDefNode) {
        console.log(`Found function definition node: type=${functionDefNode.type}, text=${functionDefNode.text.substring(0, 30)}`);

        const visitor = new FunctionVisitor(code);
        const result = visitor.visitFunctionDefinition(functionDefNode);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('function_definition');
        expect(result?.name).toBe('add');
        expect(result?.parameters).toHaveLength(2);
        expect(result?.parameters[0].name).toBe('a');
        expect(result?.parameters[0].defaultValue).toBe(0);
        expect(result?.parameters[1].name).toBe('b');
        expect(result?.parameters[1].defaultValue).toBe(0);
        expect(result?.expression).toBeDefined();
        expect(result?.expression.value).toBe('a + b');
      }
    });

    it('should parse a function definition with mixed parameter types', async () => {
      const code = `
        function createVector(x=0, y=0, z=0) = [x, y, z];
      `;
      const tree = parser.parse(code);
      const rootNode = tree.rootNode;

      // Find the function definition node - use statement nodes
      const functionDefNode = rootNode.namedChildren.find(child =>
        child.type === 'function_definition' ||
        (child.type === 'statement' && child.text.includes('function'))
      );

      expect(functionDefNode).toBeDefined();

      if (functionDefNode) {
        console.log(`Found function definition node: type=${functionDefNode.type}, text=${functionDefNode.text.substring(0, 30)}`);

        const visitor = new FunctionVisitor(code);
        const result = visitor.visitFunctionDefinition(functionDefNode);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('function_definition');
        expect(result?.name).toBe('createVector');
        expect(result?.parameters).toHaveLength(3);
        expect(result?.parameters[0].name).toBe('x');
        expect(result?.parameters[0].defaultValue).toBe(0);
        expect(result?.parameters[1].name).toBe('y');
        expect(result?.parameters[1].defaultValue).toBe(0);
        expect(result?.parameters[2].name).toBe('z');
        expect(result?.parameters[2].defaultValue).toBe(0);
        expect(result?.expression).toBeDefined();
        expect(result?.expression.value).toBe('[x, y, z]');
      }
    });
  });

  describe('createFunctionCallNode', () => {
    it('should create a function call node with arguments', async () => {
      const code = `
        add(1, 2);
      `;
      const tree = parser.parse(code);
      const rootNode = tree.rootNode;

      // Debug: Print all node types at the root level
      console.log('Root node children types for function call:');
      for (let i = 0; i < rootNode.namedChildCount; i++) {
        const child = rootNode.namedChild(i);
        if (child) {
          console.log(`Child ${i}: type=${child.type}, text=${child.text.substring(0, 30)}`);
        }
      }

      // Find the statement node
      const stmtNode = rootNode.namedChildren.find(child =>
        child.type === 'expression_statement' ||
        child.type === 'statement'
      );

      expect(stmtNode).toBeDefined();

      if (stmtNode) {
        console.log(`Found statement node: type=${stmtNode.type}, text=${stmtNode.text.substring(0, 30)}`);

        const visitor = new FunctionVisitor(code);
        // Use visitStatement instead of visitExpressionStatement
        const result = visitor.visitStatement(stmtNode);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('function_call');
        expect((result as ast.FunctionCallNode).name).toBe('add');
        expect((result as ast.FunctionCallNode).arguments).toHaveLength(2);
      }
    });
  });
});
