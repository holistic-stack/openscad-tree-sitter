/**
 * @file Tests for OpenSCAD Position Utilities implementation.
 * @module ide-support/position-utilities/position-utilities.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser } from '../../openscad-parser/enhanced-parser.js';
import { SimpleErrorHandler } from '../../openscad-parser/error-handling/simple-error-handler.js';
import { OpenSCADPositionUtilities } from './position-utilities.js';
import { OpenSCADSymbolProvider } from '../symbol-provider/symbol-provider.js';
import type { ASTNode, Position } from '../../openscad-parser/ast/ast-types.js';

describe('OpenSCADPositionUtilities', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: SimpleErrorHandler;
  let symbolProvider: OpenSCADSymbolProvider;
  let positionUtilities: OpenSCADPositionUtilities;

  beforeEach(async () => {
    errorHandler = new SimpleErrorHandler();
    parser = new EnhancedOpenscadParser(errorHandler);
    await parser.init();
    symbolProvider = new OpenSCADSymbolProvider(parser, errorHandler);
    positionUtilities = new OpenSCADPositionUtilities(symbolProvider);
  });

  afterEach(() => {
    parser.dispose();
  });

  describe('findNodeAt', () => {
    it('should find node at specific position in simple module', async () => {
      const code = 'module test() { cube(10); }';
      const ast = parser.parseAST(code);
      
      expect(ast).toBeDefined();
      expect(Array.isArray(ast)).toBe(true);
      expect(ast.length).toBeGreaterThan(0);

      // Position at the beginning of 'module'
      const position: Position = { line: 0, column: 0, offset: 0 };
      const node = positionUtilities.findNodeAt(ast, position);
      
      expect(node).toBeDefined();
      expect(node?.type).toBe('module_definition');
    });

    it('should find node at position inside module body', async () => {
      const code = 'module test() { cube(10); }';
      const ast = parser.parseAST(code);
      
      // Position inside the cube call
      const position: Position = { line: 0, column: 16, offset: 16 };
      const node = positionUtilities.findNodeAt(ast, position);
      
      expect(node).toBeDefined();
      // Should find the most specific node at that position
    });

    it('should return null for position outside any node', async () => {
      const code = 'cube(10);';
      const ast = parser.parseAST(code);
      
      // Position far beyond the code
      const position: Position = { line: 10, column: 50, offset: 1000 };
      const node = positionUtilities.findNodeAt(ast, position);
      
      expect(node).toBeNull();
    });

    it('should handle empty AST', () => {
      const ast: ASTNode[] = [];
      const position: Position = { line: 0, column: 0, offset: 0 };
      const node = positionUtilities.findNodeAt(ast, position);
      
      expect(node).toBeNull();
    });

    it('should handle invalid AST input', () => {
      const position: Position = { line: 0, column: 0, offset: 0 };
      const node = positionUtilities.findNodeAt(null as any, position);
      
      expect(node).toBeNull();
    });
  });

  describe('getNodeRange', () => {
    it('should get range for module definition node', async () => {
      const code = 'module test() { cube(10); }';
      const ast = parser.parseAST(code);
      
      expect(ast.length).toBeGreaterThan(0);
      const moduleNode = ast[0];
      
      const range = positionUtilities.getNodeRange(moduleNode);
      
      expect(range).toBeDefined();
      expect(range.start).toBeDefined();
      expect(range.end).toBeDefined();
      expect(range.start.line).toBe(0);
      expect(range.start.column).toBe(0);
      expect(range.end.line).toBeGreaterThanOrEqual(0);
      expect(range.end.column).toBeGreaterThan(range.start.column);
    });

    it('should handle node without location', () => {
      const mockNode: ASTNode = {
        type: 'test_node',
        // No location property
      } as any;
      
      const range = positionUtilities.getNodeRange(mockNode);
      
      expect(range).toBeDefined();
      expect(range.start.line).toBe(0);
      expect(range.start.column).toBe(0);
      expect(range.end.line).toBe(0);
      expect(range.end.column).toBe(0);
    });
  });

  describe('getHoverInfo', () => {
    it('should get hover info for module definition', async () => {
      const code = 'module test_module(size = 10) { cube(size); }';
      const ast = parser.parseAST(code);
      
      expect(ast.length).toBeGreaterThan(0);
      const moduleNode = ast[0];
      
      const hoverInfo = positionUtilities.getHoverInfo(moduleNode);
      
      expect(hoverInfo).toBeDefined();
      expect(hoverInfo?.kind).toBe('module');
      expect(hoverInfo?.description).toContain('Module:');
      expect(hoverInfo?.description).toContain('test_module');
      expect(hoverInfo?.node).toBe(moduleNode);
      expect(hoverInfo?.range).toBeDefined();
    });

    it('should get hover info for function definition', async () => {
      const code = 'function calc(x, y = 5) = x + y;';
      const ast = parser.parseAST(code);
      
      expect(ast.length).toBeGreaterThan(0);
      const functionNode = ast[0];
      
      const hoverInfo = positionUtilities.getHoverInfo(functionNode);
      
      expect(hoverInfo).toBeDefined();
      expect(hoverInfo?.kind).toBe('function');
      expect(hoverInfo?.description).toContain('Function:');
      expect(hoverInfo?.description).toContain('calc');
      expect(hoverInfo?.context?.returnType).toBe('any');
    });

    it('should get hover info for variable assignment', async () => {
      const code = 'width = 20;';
      const ast = parser.parseAST(code);
      
      expect(ast.length).toBeGreaterThan(0);
      const assignNode = ast[0];
      
      const hoverInfo = positionUtilities.getHoverInfo(assignNode);
      
      expect(hoverInfo).toBeDefined();
      expect(hoverInfo?.kind).toBe('variable');
      expect(hoverInfo?.description).toContain('Variable:');
    });

    it('should handle unknown node types', async () => {
      const mockNode: ASTNode = {
        type: 'unknown_type',
        location: {
          start: { line: 0, column: 0, offset: 0 },
          end: { line: 0, column: 5, offset: 5 },
        },
      } as any;
      
      const hoverInfo = positionUtilities.getHoverInfo(mockNode);
      
      expect(hoverInfo).toBeDefined();
      expect(hoverInfo?.kind).toBe('statement');
      expect(hoverInfo?.description).toBe('unknown_type');
    });
  });

  describe('getCompletionContext', () => {
    it('should get completion context for module definition', async () => {
      const code = 'module test() { cube(10); }';
      const ast = parser.parseAST(code);
      
      const position: Position = { line: 0, column: 0, offset: 0 };
      const context = positionUtilities.getCompletionContext(ast, position);
      
      expect(context).toBeDefined();
      expect(context.availableSymbols).toBeDefined();
      expect(Array.isArray(context.availableSymbols)).toBe(true);
      expect(context.type).toBeDefined();
    });

    it('should get completion context with available symbols', async () => {
      const code = `
        module test_module() { }
        function test_func() = 5;
        width = 10;
      `;
      const ast = parser.parseAST(code);
      
      const position: Position = { line: 3, column: 0, offset: 50 };
      const context = positionUtilities.getCompletionContext(ast, position);
      
      expect(context).toBeDefined();
      expect(context.availableSymbols.length).toBeGreaterThan(0);
      
      // Should have symbols for module, function, and variable
      const symbolNames = context.availableSymbols.map(s => s.name);
      expect(symbolNames).toContain('test_module');
      expect(symbolNames).toContain('test_func');
      expect(symbolNames).toContain('width');
    });

    it('should handle empty AST for completion context', () => {
      const ast: ASTNode[] = [];
      const position: Position = { line: 0, column: 0, offset: 0 };
      const context = positionUtilities.getCompletionContext(ast, position);
      
      expect(context).toBeDefined();
      expect(context.type).toBe('unknown');
      expect(context.availableSymbols).toHaveLength(0);
    });
  });

  describe('isPositionInRange', () => {
    it('should return true for position within range', () => {
      const position: Position = { line: 1, column: 5, offset: 15 };
      const range = {
        start: { line: 1, column: 0, offset: 10 },
        end: { line: 1, column: 10, offset: 20 },
      };
      
      const result = positionUtilities.isPositionInRange(position, range);
      expect(result).toBe(true);
    });

    it('should return false for position outside range', () => {
      const position: Position = { line: 2, column: 5, offset: 25 };
      const range = {
        start: { line: 1, column: 0, offset: 10 },
        end: { line: 1, column: 10, offset: 20 },
      };
      
      const result = positionUtilities.isPositionInRange(position, range);
      expect(result).toBe(false);
    });

    it('should handle position at range boundaries', () => {
      const range = {
        start: { line: 1, column: 0, offset: 10 },
        end: { line: 1, column: 10, offset: 20 },
      };
      
      // Position at start (inclusive)
      const startPos: Position = { line: 1, column: 0, offset: 10 };
      expect(positionUtilities.isPositionInRange(startPos, range)).toBe(true);
      
      // Position at end (exclusive)
      const endPos: Position = { line: 1, column: 10, offset: 20 };
      expect(positionUtilities.isPositionInRange(endPos, range)).toBe(false);
    });
  });

  describe('findNodesContaining', () => {
    it('should find all nodes containing a position', async () => {
      const code = 'module test() { cube(10); }';
      const ast = parser.parseAST(code);
      
      // Position inside the module
      const position: Position = { line: 0, column: 5, offset: 5 };
      const nodes = positionUtilities.findNodesContaining(ast, position);
      
      expect(nodes).toBeDefined();
      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes.length).toBeGreaterThan(0);
      
      // Should include the module definition
      expect(nodes.some(node => node.type === 'module_definition')).toBe(true);
    });

    it('should return empty array for position outside all nodes', async () => {
      const code = 'cube(10);';
      const ast = parser.parseAST(code);
      
      // Position far outside
      const position: Position = { line: 10, column: 50, offset: 1000 };
      const nodes = positionUtilities.findNodesContaining(ast, position);
      
      expect(nodes).toHaveLength(0);
    });

    it('should handle empty AST', () => {
      const ast: ASTNode[] = [];
      const position: Position = { line: 0, column: 0, offset: 0 };
      const nodes = positionUtilities.findNodesContaining(ast, position);
      
      expect(nodes).toHaveLength(0);
    });
  });
});
