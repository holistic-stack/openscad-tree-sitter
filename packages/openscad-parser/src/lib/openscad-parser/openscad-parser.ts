/**
 * tree-sitter-openscad-parser.ts
 *
 * A parser for OpenSCAD code using the Tree-sitter library.
 * This class provides a simple interface for parsing OpenSCAD code and getting an AST.
 *
 * @module lib/openscad-parser/tree-sitter-openscad-parser/tree-sitter-openscad-parser
 * @author Augment Code
 * @created 2023-07-10
 * @updated 2023-07-10
 *
 * @example
 * ```typescript
 * // Create a parser instance
 * const parser = new TreeSitterOpenSCADParser();
 *
 * // Initialize the parser (must be done before parsing)
 * await parser.init();
 *
 * // Parse some OpenSCAD code
 * const ast = parser.parse('cube([10, 10, 10]);');
 * console.log(ast.rootNode.type); // 'source_file'
 *
 * // Clean up when done
 * parser.dispose();
 * ```
 *
 * @dependencies
 * - web-tree-sitter: For parsing OpenSCAD code
 * - tree-sitter-openscad.wasm: WebAssembly module containing the OpenSCAD grammar
 *
 * @notes
 * - The parser must be initialized with init() before use
 * - Call dispose() when done to free resources
 * - The parser can be reused for multiple parse operations
 */

// Import the Parser class from web-tree-sitter
import * as TreeSitter from 'web-tree-sitter';
import { VisitorASTGenerator } from './ast/visitor-ast-generator';
import { ASTNode } from './ast/ast-types';
// Import the new error handling system
import {
  ErrorHandler,
  ParserError,
  SyntaxError,
  RecoveryStrategyRegistry,
  Severity,
  Logger,
} from './error-handling/index';
import { ChangeTracker } from './ast/changes/change-tracker'; // Change is not used

/**
 * A parser for OpenSCAD code using the Tree-sitter library.
 *
 * This class provides a simple interface for parsing OpenSCAD code and getting an AST.
 * It handles loading the Tree-sitter WebAssembly module and initializing the parser.
 *
 * Usage:
 * 1. Create an instance of TreeSitterOpenSCADParser
 * 2. Call init() to initialize the parser
 * 3. Call parse() to parse OpenSCAD code
 * 4. Call dispose() when done to free resources
 *
 * @implements {Disposable} - The parser can be disposed to free resources
 */
export class OpenscadParser {
  /**
   * The Tree-sitter parser instance
   * @private
   */
  private parser: TreeSitter.Parser | null = null;

  /**
   * The Tree-sitter language
   * @private
   */
  private language: TreeSitter.Language | null = null;

  /**
   * The previous parse tree for incremental parsing
   * @private
   */
  private previousTree: TreeSitter.Tree | null = null;

  /**
   * The change tracker for tracking changes to the source code
   * @private
   */
  private changeTracker: ChangeTracker = new ChangeTracker();

  /**
   * The error handler for managing errors and recovery
   * @private
   */
  private errorHandler: ErrorHandler;

  /**
   * The recovery strategy registry for error recovery
   * @private
   */
  private recoveryRegistry: RecoveryStrategyRegistry;

  /**
   * The logger for logging messages
   * @private
   */
  private logger: Logger;

  /**
   * Whether the parser has been initialized
   */
  public isInitialized = false;

  /**
   * Creates a new OpenscadParser
   * @param options Options for the parser
   */
  constructor(
    options: {
      throwErrors?: boolean;
      minSeverity?: Severity;
      includeSource?: boolean;
      attemptRecovery?: boolean;
    } = {}
  ) {
    this.logger = new Logger();
    this.errorHandler = new ErrorHandler({
      throwErrors: options.throwErrors !== false,
      minSeverity: options.minSeverity || Severity.WARNING,
      includeSource: options.includeSource !== false,
      attemptRecovery: options.attemptRecovery !== false,
    });
    this.recoveryRegistry = new RecoveryStrategyRegistry();
  }

  /**
   * Initialize the parser by loading the WebAssembly file and setting up the language.
   * This must be called before using the parse method.
   *
   * @returns A promise that resolves when the parser is initialized, or rejects if there's an error
   * @param openscadWasmPath - Optional path to the WebAssembly file. If not provided, it will try to use the one from @openscad/tree-sitter-openscad
   */
  public async init(openscadWasmPath?: string): Promise<void> {
    try {
      this.logger.info('Initializing OpenSCAD parser...');

      const wasmPath = openscadWasmPath || './tree-sitter-openscad.wasm';
      this.logger.debug(`Loading WASM file from: ${wasmPath}`);

      const bytes = await fetch(wasmPath).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.bytes();
      });

      // Initialize the TreeSitter parser
      this.logger.debug('Initializing Tree-sitter parser...');
      await TreeSitter.Parser.init();
      this.parser = new TreeSitter.Parser();

      try {
        // Load the language from the WASM file
        this.logger.debug('Loading OpenSCAD language from WASM...');
        this.language = await TreeSitter.Language.load(bytes);
        this.parser.setLanguage(this.language);
        this.isInitialized = true;
        this.logger.info('OpenSCAD parser initialized successfully');
      } catch (err) {
        const error = this.errorHandler.createParserError(
          `Failed to load language: ${err}`,
          {
            source: wasmPath,
          }
        );
        this.logger.error(error.getFormattedMessage());
        throw error;
      }
    } catch (err) {
      const error =
        err instanceof ParserError
          ? err
          : this.errorHandler.createParserError(
              `Failed to initialize OpenscadParser: ${err}`,
              {
                source: openscadWasmPath || './tree-sitter-openscad.wasm',
              }
            );

      this.logger.error(error.getFormattedMessage());
      throw error;
    }
  }

  /**
   * Parse OpenSCAD code and return a CST (Concrete Syntax Tree).
   *
   * @param code - The OpenSCAD code to parse
   * @param previousTree - Optional previous parse tree for incremental parsing
   * @returns The parse tree or null
   * @throws If the parser hasn't been initialized or there's an error parsing the code
   */
  parseCST(
    code: string,
    previousTree?: TreeSitter.Tree | null
  ): TreeSitter.Tree | null {
    if (!this.isInitialized || !this.parser) {
      // This case should still throw synchronously as it's a precondition failure
      throw this.errorHandler.createParserError(
        'Parser not initialized. Call init() first.',
        { source: 'parseCST' }
      );
    }

    try {
      this.logger.debug('Parsing OpenSCAD code...');

      // Use the provided previous tree or the stored one
      const prevTree = previousTree || this.previousTree;

      // Tree-sitter's parse method is synchronous, so we can just return its result
      const tree = this.parser.parse(code, prevTree);

      // Store the tree for future incremental parsing
      this.previousTree = tree;

      // Check for syntax errors in the tree
      if (tree) {
        const errorNode = this.findErrorNode(tree.rootNode);
        if (errorNode) {
          this.logger.debug(
            `Found error node at line ${
              errorNode.startPosition.row + 1
            }, column ${errorNode.startPosition.column + 1}`
          );

          // Extract source code snippet around the error
          const lines = code.split('\n');
          const errorLine = errorNode.startPosition.row;
          const startLine = Math.max(0, errorLine - 2);
          const endLine = Math.min(lines.length - 1, errorLine + 2);
          const sourceSnippet = lines.slice(startLine, endLine + 1).join('\n');

          // Create a syntax error with the error node information
          const error = this.errorHandler.createSyntaxError(
            `Syntax error in OpenSCAD code`,
            {
              line: errorNode.startPosition.row + 1,
              column: errorNode.startPosition.column + 1,
              source: sourceSnippet,
              nodeType: errorNode.type,
            }
          );

          // Try to recover from the error
          if (this.errorHandler.options.attemptRecovery) {
            const recoveredCode = this.errorHandler.attemptRecovery(
              error,
              code
            );
            if (recoveredCode) {
              this.logger.info(
                `Recovered from syntax error at line ${
                  errorNode.startPosition.row + 1
                }, column ${errorNode.startPosition.column + 1}`
              );

              // Parse the recovered code
              const recoveredTree = this.parser.parse(recoveredCode);

              // Check if the recovered code still has errors
              if (recoveredTree && recoveredTree.rootNode) {
                const newErrorNode = this.findErrorNode(recoveredTree.rootNode);
                if (!newErrorNode) {
                  this.logger.info(
                    'Recovery successful, no more syntax errors'
                  );
                  this.previousTree = recoveredTree;
                  return recoveredTree;
                } else {
                  this.logger.warn(
                    'Recovery attempt did not fix all syntax errors'
                  );
                }
              } else {
                this.logger.warn('Recovery produced invalid tree');
              }
            } else {
              this.logger.warn('Could not recover from syntax error');
            }
          }

          // If we couldn't recover or recovery is disabled, just log the error
          this.logger.error(error.getFormattedMessage());
        }
      }

      return tree;
    } catch (err) {
      // If it's already a ParserError, just rethrow it
      if (err instanceof ParserError) {
        this.logger.error(err.getFormattedMessage());
        throw err;
      }

      // Otherwise, wrap it in a generic ParserError
      const error = this.errorHandler.createParserError(
        `Failed to parse OpenSCAD code: ${
          err instanceof Error ? err.message : String(err)
        }`,
        {
          source: code.length > 100 ? code.substring(0, 100) + '...' : code,
        }
      );

      this.logger.error(error.getFormattedMessage());
      throw error;
    }
  }

  /**
   * Find the first error node in the tree
   *
   * @param node - The root node to search from
   * @returns The first error node found, or null if no errors
   */
  private findErrorNode(node: TreeSitter.Node): TreeSitter.Node | null {
    // Check if this node is an error node
    if (node.type === 'ERROR') {
      return node;
    }

    // Check all children recursively
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        const errorNode = this.findErrorNode(child);
        if (errorNode) {
          return errorNode;
        }
      }
    }

    return null;
  }

  /**
   * Update the parse tree incrementally with a change to the source code
   *
   * @param newCode - The new source code after the change
   * @param startIndex - The index where the change starts
   * @param oldEndIndex - The index where the old text ends
   * @param newEndIndex - The index where the new text ends
   * @returns The updated parse tree
   * @throws If the parser hasn't been initialized or there's an error parsing the code
   */
  update(
    newCode: string,
    startIndex: number,
    oldEndIndex: number,
    newEndIndex: number
  ): TreeSitter.Tree | null {
    if (!this.isInitialized || !this.parser) {
      throw this.errorHandler.createParserError(
        'Parser not initialized. Call init() first.',
        { source: 'update' }
      );
    }

    if (!this.previousTree) {
      this.logger.debug('No previous tree available, parsing from scratch');
      // If there's no previous tree, just parse from scratch
      return this.parseCST(newCode);
    }

    try {
      this.logger.debug(
        `Updating parse tree with change at [${startIndex}, ${oldEndIndex}] -> [${startIndex}, ${newEndIndex}]`
      );

      // Track the change
      const change = this.changeTracker.trackChange(
        startIndex,
        oldEndIndex,
        newEndIndex,
        newCode
      );

      // Apply the edit to the previous tree
      this.previousTree.edit(change);

      // Parse with the edited tree
      const newTree = this.parser.parse(newCode, this.previousTree);

      // Store the new tree for future incremental parsing
      this.previousTree = newTree;

      // Check for syntax errors in the updated tree
      if (newTree) {
        const errorNode = this.findErrorNode(newTree.rootNode);
        if (errorNode) {
          this.logger.debug(
            `Found error node in updated tree at line ${
              errorNode.startPosition.row + 1
            }, column ${errorNode.startPosition.column + 1}`
          );

          // Extract source code snippet around the error
          const lines = newCode.split('\n');
          const errorLine = errorNode.startPosition.row;
          const startLine = Math.max(0, errorLine - 2);
          const endLine = Math.min(lines.length - 1, errorLine + 2);
          const sourceSnippet = lines.slice(startLine, endLine + 1).join('\n');

          // Create a syntax error with the error node information
          const error = this.errorHandler.createSyntaxError(
            `Syntax error in updated OpenSCAD code`,
            {
              line: errorNode.startPosition.row + 1,
              column: errorNode.startPosition.column + 1,
              source: sourceSnippet,
              nodeType: errorNode.type,
            }
          );

          // Log the error but don't throw it
          this.logger.warn(error.getFormattedMessage());
        }
      }

      return newTree;
    } catch (err) {
      // If it's already a ParserError, just rethrow it
      if (err instanceof ParserError) {
        this.logger.error(err.getFormattedMessage());
        throw err;
      }

      // Otherwise, wrap it in a generic ParserError
      const error = this.errorHandler.createParserError(
        `Failed to update parse tree: ${
          err instanceof Error ? err.message : String(err)
        }`,
        {
          source:
            newCode.length > 100 ? newCode.substring(0, 100) + '...' : newCode,
        }
      );

      this.logger.error(error.getFormattedMessage());
      throw error;
    }
  }

  /**
   * Parse OpenSCAD code and return an AST (Abstract Syntax Tree).
   *
   * @param code - The OpenSCAD code to parse
   * @returns An array of AST nodes representing the parsed code
   * @throws If the parser hasn't been initialized or there's an error parsing the code
   */
  parseAST(code: string): ASTNode[] {
    try {
      this.logger.debug('Generating AST from OpenSCAD code...');

      const cst = this.parseCST(code);
      if (!cst) {
        this.logger.warn('Failed to generate CST, returning empty AST');
        return [];
      }

      const generator = new VisitorASTGenerator(cst, code, this.language);
      const ast = generator.generate();

      this.logger.debug(`Generated AST with ${ast.length} top-level nodes`);
      return ast;
    } catch (err) {
      // If it's already a ParserError, just rethrow it
      if (err instanceof ParserError) {
        this.logger.error(err.getFormattedMessage());
        throw err;
      }

      // Otherwise, wrap it in a generic ParserError
      const error = this.errorHandler.createParserError(
        `Failed to generate AST: ${
          err instanceof Error ? err.message : String(err)
        }`,
        {
          source: code.length > 100 ? code.substring(0, 100) + '...' : code,
        }
      );

      this.logger.error(error.getFormattedMessage());
      throw error;
    }
  }

  /**
   * Update the AST incrementally with a change to the source code
   *
   * @param newCode - The new source code after the change
   * @param startIndex - The index where the change starts
   * @param oldEndIndex - The index where the old text ends
   * @param newEndIndex - The index where the new text ends
   * @returns The updated AST
   * @throws If the parser hasn't been initialized or there's an error parsing the code
   */
  updateAST(
    newCode: string,
    startIndex: number,
    oldEndIndex: number,
    newEndIndex: number
  ): ASTNode[] {
    try {
      this.logger.debug(
        `Updating AST with change at [${startIndex}, ${oldEndIndex}] -> [${startIndex}, ${newEndIndex}]`
      );

      // Update the CST first
      const updatedCST = this.update(
        newCode,
        startIndex,
        oldEndIndex,
        newEndIndex
      );
      if (!updatedCST) {
        this.logger.warn('Failed to update CST, returning empty AST');
        return [];
      }

      // Generate the AST with the changes
      const generator = new VisitorASTGenerator(
        updatedCST,
        newCode,
        this.language
      );

      // TODO: Implement incremental AST generation in VisitorASTGenerator
      // For now, just generate the AST from scratch
      const ast = generator.generate();

      this.logger.debug(
        `Generated updated AST with ${ast.length} top-level nodes`
      );
      return ast;
    } catch (err) {
      // If it's already a ParserError, just rethrow it
      if (err instanceof ParserError) {
        this.logger.error(err.getFormattedMessage());
        throw err;
      }

      // Otherwise, wrap it in a generic ParserError
      const error = this.errorHandler.createParserError(
        `Failed to update AST: ${
          err instanceof Error ? err.message : String(err)
        }`,
        {
          source:
            newCode.length > 100 ? newCode.substring(0, 100) + '...' : newCode,
        }
      );

      this.logger.error(error.getFormattedMessage());
      throw error;
    }
  }

  /**
   * Parse OpenSCAD code and return a CST (Concrete Syntax Tree).
   * This is an alias for parseCST for backward compatibility.
   *
   * @param code - The OpenSCAD code to parse
   * @param previousTree - Optional previous parse tree for incremental parsing
   * @returns The parse tree or null
   */
  parse(
    code: string,
    previousTree?: TreeSitter.Tree | null
  ): TreeSitter.Tree | null {
    this.logger.debug('Using parse alias for parseCST');
    return this.parseCST(code, previousTree);
  }

  /**
   * Dispose of the parser and free resources.
   * Call this when you're done with the parser to avoid memory leaks.
   */
  dispose(): void {
    try {
      this.logger.debug('Disposing OpenSCAD parser...');

      if (this.parser) {
        this.parser.delete();
        this.parser = null;
        this.language = null;
        this.previousTree = null;
        this.changeTracker.clear();
        this.isInitialized = false;

        this.logger.info('OpenSCAD parser disposed successfully');
      } else {
        this.logger.debug('Parser already disposed or not initialized');
      }
    } catch (err) {
      this.logger.error(`Error disposing parser: ${err}`);
      // Don't throw here, as dispose is typically called during cleanup
    }
  }

  /**
   * Gets the error handler instance
   * @returns The error handler
   */
  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  /**
   * Gets the logger instance
   * @returns The logger
   */
  getLogger(): Logger {
    return this.logger;
  }

  /**
   * Sets the log level for the parser
   * @param level The log level to set
   */
  setLogLevel(level: number): void {
    this.logger.setLevel(level);
  }
}
