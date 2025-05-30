/**
 * @file Main entry point for the OpenSCAD parser library
 *
 * This module provides the primary exports for parsing OpenSCAD code into
 * Abstract Syntax Trees (AST) using Tree-sitter for initial parsing and
 * a sophisticated visitor pattern for AST generation.
 *
 * The library follows a layered architecture:
 * 1. Tree-sitter provides low-level syntax parsing (CST)
 * 2. Visitor pattern converts CST to structured AST
 * 3. Error handlers provide comprehensive error reporting
 *
 * @example Basic usage with EnhancedOpenscadParser
 * ```typescript
 * import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';
 *
 * const errorHandler = new SimpleErrorHandler();
 * const parser = new EnhancedOpenscadParser(errorHandler);
 * await parser.init();
 *
 * const ast = parser.parseAST('cube([10, 20, 30]);');
 * console.log(ast[0].type); // 'cube'
 *
 * parser.dispose();
 * ```
 *
 * @example Real Parser Pattern for testing
 * ```typescript
 * import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';
 *
 * describe('OpenSCAD Parser Tests', () => {
 *   let parser: EnhancedOpenscadParser;
 *   let errorHandler: SimpleErrorHandler;
 *
 *   beforeEach(async () => {
 *     errorHandler = new SimpleErrorHandler();
 *     parser = new EnhancedOpenscadParser(errorHandler);
 *     await parser.init();
 *   });
 *
 *   afterEach(() => {
 *     parser.dispose();
 *   });
 *
 *   it('should parse OpenSCAD code', () => {
 *     const ast = parser.parseAST('sphere(5);');
 *     expect(ast[0].type).toBe('sphere');
 *   });
 * });
 * ```
 *
 * @module openscad-parser
 * @since 0.1.0
 */

// Import the Parser class from web-tree-sitter
import * as TreeSitter from 'web-tree-sitter';

/**
 * Basic OpenSCAD parser using Tree-sitter for Concrete Syntax Tree (CST) generation.
 *
 * This class provides low-level access to the Tree-sitter parser for OpenSCAD.
 * For most use cases, prefer {@link EnhancedOpenscadParser} which provides
 * additional AST generation and error handling capabilities.
 *
 * The parser uses the tree-sitter-openscad grammar to parse OpenSCAD source code
 * into a concrete syntax tree that preserves all syntactic information including
 * whitespace and comments.
 *
 * @example Basic CST parsing
 * ```typescript
 * const parser = new OpenscadParser();
 * await parser.init();
 *
 * const tree = parser.parse('cube(10);');
 * console.log(tree?.rootNode.type); // 'source_file'
 * console.log(tree?.rootNode.toString()); // Full CST representation
 *
 * parser.dispose();
 * ```
 *
 * @example Error detection in CST
 * ```typescript
 * const parser = new OpenscadParser();
 * await parser.init();
 *
 * const tree = parser.parse('cube([10, 20, 30);'); // Missing closing bracket
 * console.log(tree?.rootNode.hasError); // true
 * console.log(tree?.rootNode.toString()); // Shows ERROR nodes
 *
 * parser.dispose();
 * ```
 *
 * @see {@link EnhancedOpenscadParser} for AST generation and error handling
 * @since 0.1.0
 */
export class OpenscadParser {
  private parser: TreeSitter.Parser | null = null;
  private language: TreeSitter.Language | null = null;
  public isInitialized = false;

  /**
   * Initialize the parser with the OpenSCAD grammar.
   *
   * This method loads the Tree-sitter WASM module and the OpenSCAD language
   * grammar. It must be called before any parsing operations.
   *
   * The initialization process:
   * 1. Loads Tree-sitter WASM runtime
   * 2. Creates a new Tree-sitter parser instance
   * 3. Loads the OpenSCAD language grammar from WASM file
   * 4. Configures the parser with the grammar
   *
   * @param wasmPath - Path to the tree-sitter-openscad.wasm file
   * @returns Promise that resolves when initialization is complete
   * @throws {Error} If WASM loading fails or grammar cannot be loaded
   *
   * @example Initialization with error handling
   * ```typescript
   * const parser = new OpenscadParser();
   *
   * try {
   *   await parser.init('./tree-sitter-openscad.wasm');
   *   console.log('Parser initialized successfully');
   * } catch (error) {
   *   console.error('Failed to initialize parser:', error);
   * }
   * ```
   *
   * @example Custom WASM path
   * ```typescript
   * const parser = new OpenscadParser();
   * await parser.init('/assets/grammars/tree-sitter-openscad.wasm');
   * ```
   *
   * @since 0.1.0
   */
  async init(wasmPath = './tree-sitter-openscad.wasm'): Promise<void> {
    const bytes = await fetch(wasmPath).then(response => response.arrayBuffer());
    await TreeSitter.Parser.init();
    this.parser = new TreeSitter.Parser();
    this.language = await TreeSitter.Language.load(new Uint8Array(bytes));
    this.parser.setLanguage(this.language);
    this.isInitialized = true;
  }

  /**
   * Parse OpenSCAD source code into a Concrete Syntax Tree (CST).
   *
   * This method parses the provided OpenSCAD code and returns a Tree-sitter
   * Tree object representing the concrete syntax tree. The CST preserves all
   * syntactic information including whitespace, comments, and error nodes.
   *
   * @param code - The OpenSCAD source code to parse
   * @returns Tree-sitter Tree object or null if parsing fails
   * @throws {Error} If parser is not initialized
   *
   * @example Parsing valid OpenSCAD code
   * ```typescript
   * const parser = new OpenscadParser();
   * await parser.init();
   *
   * const tree = parser.parse(`
   *   difference() {
   *     cube([20, 20, 20]);
   *     sphere(10);
   *   }
   * `);
   *
   * console.log(tree?.rootNode.type); // 'source_file'
   * console.log(tree?.rootNode.childCount); // Number of top-level statements
   * ```
   *
   * @example Handling syntax errors
   * ```typescript
   * const tree = parser.parse('cube([10, 20, 30);'); // Missing closing bracket
   *
   * if (tree?.rootNode.hasError) {
   *   console.log('Syntax errors detected');
   *   // Walk the tree to find ERROR nodes
   *   const cursor = tree.walk();
   *   // ... error handling logic
   * }
   * ```
   *
   * @since 0.1.0
   */
  parse(code: string): TreeSitter.Tree | null {
    if (!this.parser) throw new Error('Parser not initialized');
    return this.parser.parse(code);
  }

  /**
   * Dispose the parser and free associated resources.
   *
   * This method cleans up the Tree-sitter parser instance and releases
   * any associated memory. It should always be called when the parser
   * is no longer needed to prevent memory leaks.
   *
   * After calling dispose(), the parser cannot be used until init() is
   * called again.
   *
   * @example Proper cleanup
   * ```typescript
   * const parser = new OpenscadParser();
   * await parser.init();
   *
   * try {
   *   const tree = parser.parse('cube(10);');
   *   // Process the tree...
   * } finally {
   *   parser.dispose(); // Always clean up
   * }
   * ```
   *
   * @example Using with try-finally
   * ```typescript
   * const parser = new OpenscadParser();
   * await parser.init();
   *
   * try {
   *   // Multiple parsing operations
   *   const tree1 = parser.parse('cube(10);');
   *   const tree2 = parser.parse('sphere(5);');
   *   // Process trees...
   * } finally {
   *   parser.dispose();
   * }
   * ```
   *
   * @since 0.1.0
   */
  dispose(): void {
    if (this.parser) {
      this.parser.delete();
      this.parser = null;
      this.language = null;
      this.isInitialized = false;
    }
  }
}

// Re-export enhanced parser and error handling
export { EnhancedOpenscadParser } from './openscad-parser/enhanced-parser.js';
export { SimpleErrorHandler, type IErrorHandler } from './openscad-parser/error-handling/simple-error-handler.js';

// Re-export AST types for consumers
export * from './openscad-parser/ast/ast-types.js';
