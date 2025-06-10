/**
 * @file Integration tests for Position Utilities with Symbol Provider.
 * @module ide-support/position-utilities/position-utilities-integration.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOpenscadParser } from '../../openscad-parser/enhanced-parser.js';
import { SimpleErrorHandler } from '../../openscad-parser/error-handling/simple-error-handler.js';
import { OpenSCADPositionUtilities } from './position-utilities.js';
import { OpenSCADSymbolProvider } from '../symbol-provider/symbol-provider.js';
import type { Position } from '../../openscad-parser/ast/ast-types.js';

describe('Position Utilities Integration', () => {
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

  describe('Complete IDE workflow', () => {
    it('should provide complete IDE support for simple OpenSCAD code', async () => {
      const code = `module my_box(size = 10) { cube(size); }
function calc_radius(diameter) = diameter / 2;
box_size = 20;
my_box(box_size);`;

      const ast = parser.parseAST(code);
      expect(ast).toBeDefined();
      expect(Array.isArray(ast)).toBe(true);

      // Test Symbol Provider integration
      const symbols = symbolProvider.getSymbols(ast);
      expect(symbols.length).toBeGreaterThan(0);

      // Should find module, function, and variable symbols
      const symbolNames = symbols.map(s => s.name);
      expect(symbolNames).toContain('my_box');
      expect(symbolNames).toContain('calc_radius');
      expect(symbolNames).toContain('box_size');

      // Test Position Utilities with Symbol Provider
      // Position at the beginning of 'module my_box'
      const modulePosition: Position = { line: 0, column: 0, offset: 0 };
      const nodeAtModule = positionUtilities.findNodeAt(ast, modulePosition);
      expect(nodeAtModule).toBeDefined();

      if (nodeAtModule) {
        const hoverInfo = positionUtilities.getHoverInfo(nodeAtModule);
        expect(hoverInfo).toBeDefined();
        expect(hoverInfo?.description).toContain('my_box');
      }

      // Test completion context
      const completionPosition: Position = { line: 3, column: 0, offset: 80 };
      const completionContext = positionUtilities.getCompletionContext(ast, completionPosition);
      expect(completionContext).toBeDefined();
      expect(completionContext.availableSymbols.length).toBeGreaterThan(0);

      // Should include all defined symbols in completion
      const completionSymbolNames = completionContext.availableSymbols.map(s => s.name);
      expect(completionSymbolNames).toContain('my_box');
      expect(completionSymbolNames).toContain('calc_radius');
      expect(completionSymbolNames).toContain('box_size');
    });

    it('should handle position-based symbol lookup', async () => {
      const code = `module test_module(param1) { cube(param1); }
test_module(10);`;

      const ast = parser.parseAST(code);

      // Position at module name
      const moduleNamePosition: Position = { line: 0, column: 7, offset: 7 };
      const symbolAtPosition = symbolProvider.getSymbolAtPosition(ast, moduleNamePosition);

      expect(symbolAtPosition).toBeDefined();
      expect(symbolAtPosition?.name).toBe('test_module');
      expect(symbolAtPosition?.kind).toBe('module');

      // Test position utilities for the same position
      const nodeAtPosition = positionUtilities.findNodeAt(ast, moduleNamePosition);
      expect(nodeAtPosition).toBeDefined();

      if (nodeAtPosition) {
        const range = positionUtilities.getNodeRange(nodeAtPosition);
        expect(range.start.line).toBeGreaterThanOrEqual(0);
        expect(range.end.line).toBeGreaterThanOrEqual(range.start.line);
        expect(range.end.column).toBeGreaterThan(range.start.column);
      }
    });

    it('should provide accurate hover information with symbol context', async () => {
      const code = `function area(width) = width * 2;
result = area(5);`;

      const ast = parser.parseAST(code);

      // Find function definition node
      const functionPosition: Position = { line: 0, column: 9, offset: 9 };
      const functionNode = positionUtilities.findNodeAt(ast, functionPosition);

      expect(functionNode).toBeDefined();

      if (functionNode) {
        const hoverInfo = positionUtilities.getHoverInfo(functionNode);
        expect(hoverInfo).toBeDefined();
        expect(hoverInfo?.description).toContain('area');
      }
    });

    it('should handle nested scopes correctly', async () => {
      const code = `module outer_module() { inner_var = 42; cube(inner_var); }`;

      const ast = parser.parseAST(code);

      // Test completion context inside module
      const innerPosition: Position = { line: 0, column: 30, offset: 30 };
      const completionContext = positionUtilities.getCompletionContext(ast, innerPosition);

      expect(completionContext).toBeDefined();
      expect(completionContext.availableSymbols.length).toBeGreaterThan(0);

      // Should include symbols
      const symbolNames = completionContext.availableSymbols.map(s => s.name);
      expect(symbolNames.length).toBeGreaterThan(0);

      // Should include both the module definition and inner variables
      expect(symbolNames).toContain('inner_var');
    });

    it('should handle edge cases gracefully', async () => {
      const code = `module empty() { }
module test(size = 10) { cube(size); }`;

      const ast = parser.parseAST(code);

      // Test position outside any node
      const outsidePosition: Position = { line: 100, column: 100, offset: 10000 };
      const nodeOutside = positionUtilities.findNodeAt(ast, outsidePosition);
      expect(nodeOutside).toBeNull();

      // Test position at empty module
      const emptyModulePosition: Position = { line: 0, column: 7, offset: 7 };
      const emptyModuleNode = positionUtilities.findNodeAt(ast, emptyModulePosition);
      expect(emptyModuleNode).toBeDefined();

      if (emptyModuleNode) {
        const hoverInfo = positionUtilities.getHoverInfo(emptyModuleNode);
        expect(hoverInfo).toBeDefined();
        expect(hoverInfo?.description).toContain('empty');
      }

      // Test completion context
      const complexPosition: Position = { line: 1, column: 10, offset: 30 };
      const complexContext = positionUtilities.getCompletionContext(ast, complexPosition);
      expect(complexContext).toBeDefined();
      expect(complexContext.type).toBeDefined();
    });
  });

  describe('Performance characteristics', () => {
    it('should handle large AST efficiently', async () => {
      // Generate a moderately complex OpenSCAD file
      const modules = Array.from({ length: 10 }, (_, i) => 
        `module test_module_${i}(param${i} = ${i}) { cube(param${i}); }`
      ).join('\n');
      
      const variables = Array.from({ length: 20 }, (_, i) => 
        `var_${i} = ${i * 10};`
      ).join('\n');
      
      const code = `${modules}\n${variables}`;
      
      const ast = parser.parseAST(code);
      
      const startTime = performance.now();
      
      // Test multiple operations
      const symbols = symbolProvider.getSymbols(ast);
      const testPosition: Position = { line: 5, column: 10, offset: 100 };
      const node = positionUtilities.findNodeAt(ast, testPosition);
      const context = positionUtilities.getCompletionContext(ast, testPosition);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (< 200ms for this size)
      // Note: This includes parsing 30 symbols and running multiple operations
      expect(duration).toBeLessThan(200);
      expect(symbols.length).toBeGreaterThan(25); // 10 modules + 20 variables
      expect(context.availableSymbols.length).toBeGreaterThan(25);
    });
  });
});
