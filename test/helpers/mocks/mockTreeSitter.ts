/**
 * @file mockTreeSitter.ts
 * @description Mock implementation of the TreeSitter parser
 *
 * This file provides a mock implementation of the TreeSitter parser for testing purposes.
 * It simulates the behavior of the actual TreeSitter parser without requiring the native binding.
 *
 * @example
 * // Create a parser and parse some code
 * const parser = new MockTreeSitter();
 * parser.setLanguage({});
 * const tree = parser.parse('const x = 1;');
 * const rootNode = tree.rootNode;
 */

import { mockRootNode, SyntaxTree } from './mockNodeFactory';

/**
 * Interface for the TreeSitter parser
 */
export interface Parser {
  parse(code: string): SyntaxTree;
  setLanguage(language: any): void;
}

/**
 * Mock implementation of the TreeSitter parser
 */
export class MockTreeSitter implements Parser {
  private language: any = null;

  /**
   * Parse the given code and return a mock syntax tree
   *
   * @param code - The code to parse
   * @returns A mock syntax tree
   */
  parse(code: string): SyntaxTree {
    return {
      rootNode: mockRootNode(code)
    };
  }

  /**
   * Set the language for the parser
   *
   * @param language - The language to set
   */
  setLanguage(language: any): void {
    this.language = language;
  }
}

/**
 * Interface for the TreeSitter Language class
 */
export interface Language {
  load(wasmBuffer: Buffer): any;
}

/**
 * Mock implementation of the TreeSitter Language class
 */
export class MockLanguage implements Language {
  /**
   * Load a language from a WebAssembly file
   *
   * @param wasmBuffer - The WebAssembly buffer
   * @returns A mock language object
   *
   * @example
   * const wasmBuffer = fs.readFileSync('path/to/language.wasm');
   * const language = MockLanguage.load(wasmBuffer);
   */
  static load(wasmBuffer: Buffer): any {
    return {};
  }
}

/**
 * Create a mock TreeSitter parser
 *
 * @returns A mock TreeSitter parser
 *
 * @example
 * const parser = createMockParser();
 * const tree = parser.parse('const x = 1;');
 */
export function createMockParser(): Parser {
  return new MockTreeSitter();
}
