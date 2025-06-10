/**
 * @file Test suite for the OpenSCADSymbolProvider.
 * @module ide-support/symbol-provider/symbol-provider.test
 */

import { EnhancedOpenscadParser } from '../../openscad-parser/enhanced-parser.js';
import { SimpleErrorHandler } from '../../openscad-parser/error-handling/simple-error-handler.js';
import { OpenSCADSymbolProvider } from './symbol-provider.js';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Logger, Severity } from '../../openscad-parser/error-handling';
import type { ASTNode, Position } from '../../openscad-parser/ast/ast-types.js';
import type { SymbolInfo } from './symbol-types.js';

const logger = new Logger({
  level: Severity.DEBUG,
  includeTimestamp: true,
  includeSeverity: true,
});

describe('OpenSCADSymbolProvider', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: SimpleErrorHandler;
  let symbolProvider: OpenSCADSymbolProvider;

  beforeEach(async () => {
    errorHandler = new SimpleErrorHandler();
    parser = new EnhancedOpenscadParser(errorHandler);
    // Initialize the parser with the path to the OpenSCAD grammar WASM file.
    // This path should be relative to where the tests are run or an accessible location.
    // Vitest typically runs from the package root or workspace root.
    // Assuming 'tree-sitter-openscad.wasm' is available in 'node_modules/tree-sitter-openscad/'
    await parser.init();
    symbolProvider = new OpenSCADSymbolProvider(parser, errorHandler);
  });

  afterEach(() => {
    parser.dispose();
  });

  describe('getSymbols', () => {
    it('should return an empty array for empty input', () => {
      const ast: ASTNode[] = [];
      const symbols = symbolProvider.getSymbols(ast);
      expect(symbols).toEqual([]);
    });

    it('should identify a simple module definition', () => {
      const code = 'module my_module() { cube(10); }';
      console.log(`[Test:simple_module_definition] Code: ${code}`);
      const ast = parser.parseAST(code);
      console.log(
        '[Test:simple_module_definition] AST input:',
        JSON.stringify(ast, null, 2)
      );
      const symbols = symbolProvider.getSymbols(ast);
      console.log(
        '[Test:simple_module_definition] Symbols returned:',
        JSON.stringify(symbols, null, 2)
      );
      expect(symbols.length).toBe(1);
      expect(symbols[0].name).toBe('my_module');
      expect(symbols[0].kind).toBe('module');
      expect(symbols[0].loc).toBeDefined();
      expect(symbols[0].loc.start.line).toBe(0);
      // expect(symbols[0].parameters).toEqual([]); // TODO: Add parameter parsing to test
    });

    it('should identify a simple function definition', () => {
      const code = 'function my_func(a, b=5) = a + b;';
      console.log(`[Test:simple_function_definition] Code: ${code}`);
      const ast = parser.parseAST(code);
      console.log(
        '[Test:simple_function_definition] AST input:',
        JSON.stringify(ast, null, 2)
      );
      const symbols = symbolProvider.getSymbols(ast);
      expect(symbols.length).toBe(1);
      expect(symbols[0].name).toBe('my_func');
      expect(symbols[0].kind).toBe('function');
      expect(symbols[0].loc).toBeDefined();
      expect(symbols[0].loc.start.line).toBe(0);
      // TODO: Add detailed parameter checking for symbols[0].parameters
    });

    it('should identify a simple variable assignment', () => {
      const code = 'my_var = 42;';
      const ast = parser.parseAST(code);
      const symbols = symbolProvider.getSymbols(ast);
      expect(symbols.length).toBe(1);
      expect(symbols[0].name).toBe('my_var');
      expect(symbols[0].kind).toBe('variable');
      expect(symbols[0].loc).toBeDefined();
      expect(symbols[0].loc.start.line).toBe(0); // For the whole assignment statement
      expect(symbols[0].nameLoc).toBeDefined(); // For the variable name itself
      expect(symbols[0].nameLoc!.start.line).toBe(0); // Name should also be on line 0
    });

    it('should identify multiple symbols', () => {
      const code = `
        module mod1() {}
        a = 10;
        function func1(p) = p * 2;
      `;
      const ast = parser.parseAST(code);
      const symbols = symbolProvider.getSymbols(ast);
      expect(symbols.length).toBe(3);
      expect(
        symbols.find(s => s.name === 'mod1' && s.kind === 'module')
      ).toBeDefined();
      expect(
        symbols.find(s => s.name === 'a' && s.kind === 'variable')
      ).toBeDefined();
      expect(
        symbols.find(s => s.name === 'func1' && s.kind === 'function')
      ).toBeDefined();
    });

    // TODO: Add more tests for various symbol kinds:
    // - parameters in modules and functions (detailed)
    // - include/use statements (if they introduce symbols)
    // - complex nested structures
    // - symbols with documentation comments (future)
  });

  describe('getSymbolAtPosition', () => {
    it('should return null if no symbol is at the position (empty space)', () => {
      const code = '  cube(10);'; // Leading spaces
      const ast = parser.parseAST(code);
      const position: Position = { line: 0, column: 0, offset: 0 };
      const symbol = symbolProvider.getSymbolAtPosition(ast, position);
      expect(symbol).toBeNull();
    });

    it('should return null if position is on a keyword not part of a symbol name', () => {
      const code = 'module my_mod() {}';
      const ast = parser.parseAST(code);
      const position: Position = { line: 0, column: 2, offset: 2 }; // on 'd' of module
      const symbol = symbolProvider.getSymbolAtPosition(ast, position);
      expect(symbol).toBeNull(); // Current implementation might return the module, needs refinement
    });

    it('should identify a module symbol at its definition name position', () => {
      const code = 'module my_module() { cube(10); }';
      const ast = parser.parseAST(code);
      const position: Position = { line: 0, column: 8, offset: 8 }; // On 'y' of my_module
      const symbol = symbolProvider.getSymbolAtPosition(ast, position);
      expect(symbol).not.toBeNull();
      if (symbol) {
        expect(symbol.name).toBe('my_module');
        expect(symbol.kind).toBe('module');
        expect(symbol.loc).toBeDefined();
        expect(symbol.loc.start.line).toBe(0);
      }
    });

    it('should identify a function symbol at its definition name position', () => {
      const code = 'function my_func(a) = a;';
      const ast = parser.parseAST(code);
      const position: Position = { line: 0, column: 10, offset: 10 }; // On 'y' of my_func
      const symbol = symbolProvider.getSymbolAtPosition(ast, position);
      logger.debug(
        `[Test.getSymbolAtPosition] For position ${JSON.stringify(
          position
        )}, received symbol: ${symbol ? symbol.name : 'null'}`
      );
      expect(symbol).not.toBeNull();
      if (symbol) {
        expect(symbol.name).toBe('my_func');
        expect(symbol.kind).toBe('function');
        expect(symbol.loc).toBeDefined();
        expect(symbol.loc.start.line).toBe(0);
      }
    });

    it('should identify a variable symbol at its definition name position', () => {
      const code = 'my_var = 123;';
      const ast = parser.parseAST(code);
      const position: Position = { line: 0, column: 2, offset: 2 }; // On '_' of my_var
      const symbol = symbolProvider.getSymbolAtPosition(ast, position);
      expect(symbol).not.toBeNull();
      if (symbol) {
        expect(symbol.name).toBe('my_var');
        expect(symbol.kind).toBe('variable');
      }
    });

    // TODO: Add more tests:
    // - position inside a symbol name (middle, end)
    // - position outside any symbol (e.g., on operators, punctuation)
    // - positions for parameters within function/module signatures
    // - positions in more complex, nested code structures
  });
});
