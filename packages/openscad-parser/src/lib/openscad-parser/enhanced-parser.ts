/**
 * @file Enhanced OpenSCAD parser with AST generation
 *
 * This extends the minimal parser to include AST generation functionality
 * while maintaining compatibility with the existing test infrastructure.
 */

import * as TreeSitter from 'web-tree-sitter';
import { SimpleErrorHandler, IErrorHandler, ASTNode } from '@/lib';
import { VisitorASTGenerator } from '@/lib/openscad-parser/ast';
import { ErrorHandler } from './error-handling/index.js';

/**
 * Enhanced OpenSCAD parser with AST generation capabilities
 *
 * This class extends the minimal parser functionality to include
 * AST generation using the visitor pattern, while maintaining
 * the same simple interface.
 */
export class EnhancedOpenscadParser {
  private parser: TreeSitter.Parser | null = null;
  private language: TreeSitter.Language | null = null;
  private previousTree: TreeSitter.Tree | null = null;
  private errorHandler: IErrorHandler;
  public isInitialized = false;

  /**
   * Create a new enhanced parser
   */
  constructor(errorHandler?: IErrorHandler) {
    this.errorHandler = errorHandler ?? new SimpleErrorHandler();
  }

  /**
   * Initialize the parser
   */
  async init(wasmPath = './tree-sitter-openscad.wasm'): Promise<void> {
    try {
      this.errorHandler.logInfo('Initializing enhanced OpenSCAD parser...');

      const bytes = await fetch(wasmPath).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.bytes();
      });

      await TreeSitter.Parser.init();
      this.parser = new TreeSitter.Parser();
      this.language = await TreeSitter.Language.load(bytes);
      this.parser.setLanguage(this.language);
      this.isInitialized = true;

      this.errorHandler.logInfo('Enhanced OpenSCAD parser initialized successfully');
    } catch (error) {
      const errorMessage = `Failed to initialize parser: ${error}`;
      this.errorHandler.handleError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Parse OpenSCAD code and return CST
   */
  parseCST(code: string): TreeSitter.Tree | null {
    if (!this.parser) {
      throw new Error('Parser not initialized');
    }

    try {
      const tree = this.parser.parse(code, this.previousTree);
      this.previousTree = tree;

      // Check for syntax errors
      if (tree && this.hasErrorNodes(tree.rootNode)) {
        const errorDetails = this.formatSyntaxError(code, tree.rootNode);
        this.errorHandler.handleError(errorDetails);
      }

      return tree;
    } catch (error) {
      this.errorHandler.handleError(`Failed to parse code: ${error}`);
      throw error;
    }
  }

  /**
   * Create an ErrorHandler adapter from IErrorHandler
   * This allows the enhanced parser to work with the visitor system
   */
  private createErrorHandlerAdapter(): ErrorHandler {
    const adapter = new ErrorHandler({
      throwErrors: false,
      attemptRecovery: false
    });

    // Override the logging methods to delegate to our IErrorHandler
    const originalLogInfo = adapter.logInfo.bind(adapter);
    const originalLogWarning = adapter.logWarning.bind(adapter);
    const originalHandleError = adapter.handleError.bind(adapter);

    adapter.logInfo = (message: string) => {
      this.errorHandler.logInfo(message);
      originalLogInfo(message);
    };

    adapter.logWarning = (message: string) => {
      this.errorHandler.logWarning(message);
      originalLogWarning(message);
    };

    adapter.handleError = (error: Error) => {
      this.errorHandler.handleError(error);
      originalHandleError(error);
    };

    return adapter;
  }

  /**
   * Parse OpenSCAD code and return AST
   *
   * Uses the visitor pattern for AST generation with real Tree-sitter integration.
   */
  parseAST(code: string): ASTNode[] {
    try {
      this.errorHandler.logInfo('Generating AST from OpenSCAD code...');

      const cst = this.parseCST(code);
      if (!cst) {
        this.errorHandler.logWarning('Failed to generate CST, returning empty AST');
        return [];
      }

      // Create visitor-based AST generator with adapter
      const errorHandlerAdapter = this.createErrorHandlerAdapter();
      const astGenerator = new VisitorASTGenerator(
        cst,
        code,
        this.language,
        errorHandlerAdapter
      );

      // Generate AST using visitor pattern
      const ast = astGenerator.generate();

      this.errorHandler.logInfo(`AST generation completed. Generated ${ast.length} top-level nodes.`);
      return ast;
    } catch (error) {
      this.errorHandler.handleError(`Failed to generate AST: ${error}`);
      throw error;
    }
  }

  /**
   * Parse OpenSCAD code (alias for parseCST for backward compatibility)
   */
  parse(code: string): TreeSitter.Tree | null {
    return this.parseCST(code);
  }

  /**
   * Update the parse tree incrementally
   */
  update(
    newCode: string,
    startIndex: number,
    oldEndIndex: number,
    newEndIndex: number
  ): TreeSitter.Tree | null {
    if (!this.parser || !this.previousTree) {
      this.errorHandler.logInfo('No previous tree available, parsing from scratch');
      return this.parseCST(newCode);
    }

    try {
      // Create edit object for tree-sitter
      const edit = {
        startIndex,
        oldEndIndex,
        newEndIndex,
        startPosition: this.indexToPosition(newCode, startIndex),
        oldEndPosition: this.indexToPosition(newCode, oldEndIndex),
        newEndPosition: this.indexToPosition(newCode, newEndIndex),
      };

      this.previousTree.edit(edit);
      const newTree = this.parser.parse(newCode, this.previousTree);
      this.previousTree = newTree;

      return newTree;
    } catch (error) {
      this.errorHandler.handleError(`Failed to update parse tree: ${error}`);
      throw error;
    }
  }

  /**
   * Update the AST incrementally
   *
   * This method performs incremental parsing and then generates a new AST
   * from the updated parse tree.
   */
  updateAST(
    newCode: string,
    startIndex: number,
    oldEndIndex: number,
    newEndIndex: number
  ): ASTNode[] {
    try {
      this.errorHandler.logInfo('Updating AST incrementally...');

      // First update the CST incrementally
      const updatedTree = this.update(newCode, startIndex, oldEndIndex, newEndIndex);

      if (!updatedTree) {
        this.errorHandler.logWarning('Failed to update CST, returning empty AST');
        return [];
      }

      // Generate new AST from updated CST
      const errorHandlerAdapter = this.createErrorHandlerAdapter();
      const astGenerator = new VisitorASTGenerator(
        updatedTree,
        newCode,
        this.language,
        errorHandlerAdapter
      );

      const ast = astGenerator.generate();

      this.errorHandler.logInfo(`AST update completed. Generated ${ast.length} top-level nodes.`);
      return ast;
    } catch (error) {
      this.errorHandler.handleError(`Failed to update AST: ${error}`);
      throw error;
    }
  }

  /**
   * Dispose the parser
   */
  dispose(): void {
    try {
      if (this.parser) {
        this.parser.delete();
        this.parser = null;
        this.language = null;
        this.previousTree = null;
        this.isInitialized = false;
        this.errorHandler.logInfo('Enhanced parser disposed successfully');
      }
    } catch (error) {
      this.errorHandler.handleError(`Error disposing parser: ${error}`);
    }
  }

  /**
   * Get the error handler
   */
  getErrorHandler(): IErrorHandler {
    return this.errorHandler;
  }

  /**
   * Check if a node has error nodes
   */
  private hasErrorNodes(node: TreeSitter.Node): boolean {
    if (node.type === 'ERROR') {
      return true;
    }

    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && this.hasErrorNodes(child)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Format a detailed syntax error message with code context
   */
  private formatSyntaxError(code: string, rootNode: TreeSitter.Node): string {
    const errorNode = this.findFirstErrorNode(rootNode);
    if (!errorNode) {
      return `Syntax error found in parsed code:\n${code}`;
    }

    const lines = code.split('\n');
    const errorLine = errorNode.startPosition.row;
    const errorColumn = errorNode.startPosition.column;

    let errorMessage = `Syntax error at line ${errorLine + 1}, column ${errorColumn + 1}:\n`;

    // Add the problematic line
    if (errorLine < lines.length) {
      errorMessage += `${lines[errorLine]}\n`;
      // Add pointer to error position
      errorMessage += ' '.repeat(errorColumn) + '^';
    }

    return errorMessage;
  }

  /**
   * Find the first ERROR node in the tree
   */
  private findFirstErrorNode(node: TreeSitter.Node): TreeSitter.Node | null {
    if (node.type === 'ERROR') {
      return node;
    }

    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        const errorNode = this.findFirstErrorNode(child);
        if (errorNode) {
          return errorNode;
        }
      }
    }

    return null;
  }

  /**
   * Convert byte index to line/column position
   */
  private indexToPosition(text: string, index: number): { row: number; column: number } {
    let row = 0;
    let column = 0;

    for (let i = 0; i < index && i < text.length; i++) {
      if (text[i] === '\n') {
        row++;
        column = 0;
      } else {
        column++;
      }
    }

    return { row, column };
  }
}
