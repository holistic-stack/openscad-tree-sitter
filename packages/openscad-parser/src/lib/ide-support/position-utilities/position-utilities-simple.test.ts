/**
 * @file Simple integration tests for Position Utilities.
 * @module ide-support/position-utilities/position-utilities-simple.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser } from '../../openscad-parser/enhanced-parser.js';
import { SimpleErrorHandler } from '../../openscad-parser/error-handling/simple-error-handler.js';
import { OpenSCADPositionUtilities } from './position-utilities.js';
import { OpenSCADSymbolProvider } from '../symbol-provider/symbol-provider.js';
import type { Position } from '../../openscad-parser/ast/ast-types.js';

describe('Position Utilities Simple Integration', () => {
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

  describe('Basic functionality', () => {
    it('should work with simple module definition', async () => {
      const code = 'module test() { cube(10); }';
      const ast = parser.parseAST(code);
      
      expect(ast).toBeDefined();
      expect(Array.isArray(ast)).toBe(true);
      expect(ast.length).toBeGreaterThan(0);

      // Test Symbol Provider
      const symbols = symbolProvider.getSymbols(ast);
      expect(symbols.length).toBeGreaterThan(0);
      expect(symbols[0].name).toBe('test');
      expect(symbols[0].kind).toBe('module');

      // Test Position Utilities
      const position: Position = { line: 0, column: 0, offset: 0 };
      const node = positionUtilities.findNodeAt(ast, position);
      expect(node).toBeDefined();
      expect(node?.type).toBe('module_definition');

      // Test hover info
      if (node) {
        const hoverInfo = positionUtilities.getHoverInfo(node);
        expect(hoverInfo).toBeDefined();
        expect(hoverInfo?.description).toContain('test');
        expect(hoverInfo?.kind).toBe('module');
      }

      // Test completion context
      const completionContext = positionUtilities.getCompletionContext(ast, position);
      expect(completionContext).toBeDefined();
      expect(completionContext.availableSymbols.length).toBeGreaterThan(0);
      expect(completionContext.availableSymbols[0].name).toBe('test');
    });

    it('should work with variable assignment', async () => {
      const code = 'width = 20;';
      const ast = parser.parseAST(code);
      
      expect(ast).toBeDefined();
      expect(ast.length).toBeGreaterThan(0);

      // Test Symbol Provider
      const symbols = symbolProvider.getSymbols(ast);
      expect(symbols.length).toBeGreaterThan(0);
      expect(symbols[0].name).toBe('width');
      expect(symbols[0].kind).toBe('variable');

      // Test Position Utilities
      const position: Position = { line: 0, column: 0, offset: 0 };
      const node = positionUtilities.findNodeAt(ast, position);
      expect(node).toBeDefined();

      if (node) {
        const hoverInfo = positionUtilities.getHoverInfo(node);
        expect(hoverInfo).toBeDefined();
        expect(hoverInfo?.description).toContain('width');
      }
    });

    it('should handle position outside nodes', async () => {
      const code = 'cube(10);';
      const ast = parser.parseAST(code);
      
      // Position far outside
      const outsidePosition: Position = { line: 100, column: 100, offset: 10000 };
      const node = positionUtilities.findNodeAt(ast, outsidePosition);
      expect(node).toBeNull();

      // Test completion context still works
      const completionContext = positionUtilities.getCompletionContext(ast, outsidePosition);
      expect(completionContext).toBeDefined();
      expect(completionContext.type).toBe('unknown');
    });

    it('should provide node ranges correctly', async () => {
      const code = 'sphere(5);';
      const ast = parser.parseAST(code);
      
      expect(ast.length).toBeGreaterThan(0);
      const node = ast[0];
      
      const range = positionUtilities.getNodeRange(node);
      expect(range).toBeDefined();
      expect(range.start.line).toBe(0);
      expect(range.start.column).toBe(0);
      expect(range.end.line).toBeGreaterThanOrEqual(0);
      expect(range.end.column).toBeGreaterThan(range.start.column);
    });

    it('should check position in range correctly', async () => {
      const range = {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 10, offset: 10 },
      };

      // Position inside range
      const insidePosition: Position = { line: 0, column: 5, offset: 5 };
      expect(positionUtilities.isPositionInRange(insidePosition, range)).toBe(true);

      // Position outside range
      const outsidePosition: Position = { line: 1, column: 5, offset: 15 };
      expect(positionUtilities.isPositionInRange(outsidePosition, range)).toBe(false);

      // Position at start (inclusive)
      const startPosition: Position = { line: 0, column: 0, offset: 0 };
      expect(positionUtilities.isPositionInRange(startPosition, range)).toBe(true);

      // Position at end (exclusive)
      const endPosition: Position = { line: 0, column: 10, offset: 10 };
      expect(positionUtilities.isPositionInRange(endPosition, range)).toBe(false);
    });

    it('should find containing nodes correctly', async () => {
      const code = 'module test() { cube(10); }';
      const ast = parser.parseAST(code);
      
      // Position inside the module
      const position: Position = { line: 0, column: 5, offset: 5 };
      const containingNodes = positionUtilities.findNodesContaining(ast, position);
      
      expect(containingNodes).toBeDefined();
      expect(Array.isArray(containingNodes)).toBe(true);
      expect(containingNodes.length).toBeGreaterThan(0);
      
      // Should include the module definition
      expect(containingNodes.some(node => node.type === 'module_definition')).toBe(true);
    });
  });

  describe('Integration with Symbol Provider', () => {
    it('should use Symbol Provider for completion context', async () => {
      const code = 'module test() { cube(10); }';
      const ast = parser.parseAST(code);
      
      const position: Position = { line: 0, column: 20, offset: 20 };
      const completionContext = positionUtilities.getCompletionContext(ast, position);
      
      expect(completionContext).toBeDefined();
      expect(completionContext.availableSymbols.length).toBeGreaterThan(0);
      
      // Should include the module symbol
      const symbolNames = completionContext.availableSymbols.map(s => s.name);
      expect(symbolNames).toContain('test');
    });

    it('should work without Symbol Provider', async () => {
      // Create Position Utilities without Symbol Provider
      const standalonePositionUtilities = new OpenSCADPositionUtilities();
      
      const code = 'cube(10);';
      const ast = parser.parseAST(code);
      
      const position: Position = { line: 0, column: 0, offset: 0 };
      const node = standalonePositionUtilities.findNodeAt(ast, position);
      expect(node).toBeDefined();
      
      if (node) {
        const hoverInfo = standalonePositionUtilities.getHoverInfo(node);
        expect(hoverInfo).toBeDefined();
      }
      
      const completionContext = standalonePositionUtilities.getCompletionContext(ast, position);
      expect(completionContext).toBeDefined();
      expect(completionContext.availableSymbols).toHaveLength(0); // No Symbol Provider
    });
  });
});
