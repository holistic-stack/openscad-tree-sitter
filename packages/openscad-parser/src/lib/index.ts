/**
 * OpenSCAD Parser Library
 *
 * This library provides both minimal and enhanced parsers for OpenSCAD code.
 * The minimal parser provides basic CST parsing, while the enhanced parser
 * includes AST generation and error handling capabilities.
 */

// Import the Parser class from web-tree-sitter
import * as TreeSitter from 'web-tree-sitter';

/**
 * A minimal parser for OpenSCAD code using Tree-sitter
 *
 * This provides the basic functionality needed for parsing OpenSCAD code
 * into a Concrete Syntax Tree (CST) using Tree-sitter.
 */
export class OpenscadParser {
  private parser: TreeSitter.Parser | null = null;
  private language: TreeSitter.Language | null = null;
  public isInitialized = false;

  /**
   * Initialize the parser
   */
  async init(wasmPath = './tree-sitter-openscad.wasm'): Promise<void> {
    const bytes = await fetch(wasmPath).then(response => response.bytes());
    await TreeSitter.Parser.init();
    this.parser = new TreeSitter.Parser();
    this.language = await TreeSitter.Language.load(bytes);
    this.parser.setLanguage(this.language);
    this.isInitialized = true;
  }

  /**
   * Parse OpenSCAD code
   */
  parse(code: string): TreeSitter.Tree | null {
    if (!this.parser) throw new Error('Parser not initialized');
    return this.parser.parse(code);
  }

  /**
   * Dispose the parser
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
