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
  // Assuming ErrorHandlerOptions and LoggerOptions might be exported from here or defined inline
  // For now, let's assume they are part of the options object structure directly
} from '@/lib';
import { ChangeTracker } from './ast/changes/change-tracker'; // Change is not used

/**
 * Options for configuring the OpenscadParser.
 */
export interface OpenscadParserOptions {
  /**
   * If true, the parser will throw an error on the first critical issue.
   * If false, errors will be collected in the ErrorHandler.
   * @default true
   */
  throwOnError?: boolean;

  /**
   * The minimum severity level for errors to be considered critical or reported.
   * @default Severity.ERROR
   */
  minSeverity?: Severity | string;

  /**
   * If true, attempts to apply recovery strategies for certain syntax errors.
   * @default false
   */
  enableRecovery?: boolean;

  /**
   * Options to pass to the ErrorHandler constructor.
   */
  errorHandlerOptions?: object; // Replace with actual ErrorHandlerOptions if defined

  /**
   * Options to pass to the Logger constructor.
   */
  loggerOptions?: object; // Replace with actual LoggerOptions if defined
}

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

  // Configuration options
  private throwOnError: boolean;
  private enableRecovery: boolean;

  /**
   * Creates a new OpenscadParser
   * @param options Options for the parser
   */
  constructor(options?: OpenscadParserOptions) {
    this.logger = new Logger(options?.loggerOptions);
    this.errorHandler = new ErrorHandler(options?.errorHandlerOptions, this.logger);

    // Set parser configurations
    this.throwOnError = options?.throwOnError ?? true;
    this.enableRecovery = options?.enableRecovery ?? false;
    const minSeverity = options?.minSeverity ?? Severity.ERROR;

    this.errorHandler.setThrowOnError(this.throwOnError);
    this.errorHandler.setMinSeverity(minSeverity);

    this.logger.info('OpenscadParser instance created.');
    this.logger.debug(`Parser configured with: throwOnError=${this.throwOnError}, enableRecovery=${this.enableRecovery}, minSeverity=${minSeverity}`);
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
    this.logger.debug(`Starting CST parsing for code snippet: ${code.substring(0, 50)}...`);
    this.errorHandler.clearErrors(); // Clear previous errors

    if (!this.isInitialized || !this.parser) {
      const error = new ParserError(
        "Parser not initialized. Call init() before parsing.",
        // @ts-expect-error - E001 is a placeholder for a real error code
        'E001',
        Severity.FATAL
      );
      this.errorHandler.addError(error); // Add to handler even if throwing
      this.logger.error(error.getFormattedMessage());
      if (this.throwOnError) throw error;
      return null;
    }

    try {
      const tree = this.parser.parse(code, previousTree || this.previousTree);
      this.previousTree = tree; // Store for potential incremental parsing
      this.logger.info('CST parsing completed.');

      // Traverse the tree to collect syntax errors from TreeSitter
      if (tree.rootNode) {
        this.collectTreeSitterErrors(tree.rootNode);
      }

      // Optional: Log collected errors for debugging
      // this.errorHandler.getErrors().forEach(e => this.logger.warn(`Collected error: ${e.getFormattedMessage()}`));

      // If configured to throw on error and critical errors are present
      if (this.throwOnError && this.errorHandler.hasCriticalErrors()) {
        // Find the first critical error (ERROR or FATAL)
        const criticalError = this.errorHandler.getErrors().find(
          e => e.severity === Severity.ERROR || e.severity === Severity.FATAL
        );
        if (criticalError) {
          this.logger.error(`Critical parsing error encountered: ${criticalError.getFormattedMessage()}`);
          throw criticalError;
        }
      }
      // Note: Recovery logic would go here if enabled and errors are present
      // For now, just returning the tree with collected errors.

      return tree;
    } catch (err) {
      // This catch block handles errors from treeSitterParser.parse() itself (e.g., unexpected internal errors)
      // or errors re-thrown from the critical error check above.
      if (err instanceof ParserError) {
        // If it's already a ParserError (e.g., re-thrown critical error), just ensure it's logged by handler if not already
        // and re-throw if throwOnError is enabled.
        if (!this.errorHandler.getErrors().includes(err)) {
            this.errorHandler.addError(err);
        }
        this.logger.error(`ParserError during CST parsing: ${err.getFormattedMessage()}`);
        if (this.throwOnError) throw err;
        return null; // Or handle as per recovery strategy if applicable
      }

      // For other types of errors, wrap them in a SyntaxError
      const syntaxError = new SyntaxError(
        `Failed to parse OpenSCAD code due to an unexpected error: ${err instanceof Error ? err.message : String(err)}`,
        {
          source: code.length > 100 ? code.substring(0, 100) + '...' : code,
        }
      );
      this.errorHandler.addError(syntaxError);
      this.logger.error(syntaxError.getFormattedMessage());
      if (this.throwOnError) throw syntaxError;
      return null;
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
   * @throws If the parser hasn't been initialized or there's an error parsing the code and throwOnError is true.
   */
  parseAST(code: string): ASTNode[] {
    this.logger.debug('Starting AST generation process...');
    this.errorHandler.clearErrors(); // Clear previous errors, including those from parseCST if called sequentially by user

    // First, get the CST. Errors from CST parsing will be collected by parseCST.
    const cst = this.parseCST(code);

    // If CST parsing failed and we are not throwing, or if CST is null for other reasons.
    if (!cst) {
      this.logger.warn('CST generation failed or resulted in null, cannot proceed to AST generation.');
      // Errors should have been collected by parseCST. If throwOnError is true, parseCST would have thrown.
      // If throwOnError is false, we return empty AST and errors are in the handler.
      return [];
    }

    // If parseCST collected errors and throwOnError is true, it would have already thrown.
    // If not throwing, proceed, but AST might be partial or based on an erroneous CST.

    try {
      this.logger.debug('Generating AST from CST...');
      // Assuming VisitorASTGenerator might need ErrorHandler. 
      // If astGenerator is stateful and configured with ErrorHandler at construction, this might not be needed.
      // For now, let's assume it can access it or we modify generate's signature if necessary.
      // Option 1: Pass error handler to generate: const astNodes = this.astGenerator.generate(cst.rootNode, code, this.errorHandler);
      // Option 2: Ensure astGenerator is constructed with this.errorHandler.
      // Current signature: this.astGenerator.generate(cst.rootNode, code)
      // For now, we'll proceed without changing signature and assume astGenerator has access or we address it separately.
      // Corrected: Instantiate VisitorASTGenerator here
      const astGenerator = new VisitorASTGenerator(cst, code, this.language, this.errorHandler);
      const astNodes = astGenerator.generate(); // generate() takes no arguments as per its definition
      this.logger.info('AST generation completed.');

      // After AST generation, check for any new errors (e.g., semantic errors from visitors)
      // that might have been added to the errorHandler by the astGenerator's process.
      if (this.throwOnError && this.errorHandler.hasCriticalErrors()) {
        const criticalError = this.errorHandler.getErrors().find(
          e => e.severity === Severity.ERROR || e.severity === Severity.FATAL
        );
        if (criticalError) {
          this.logger.error(`Critical error during AST generation: ${criticalError.getFormattedMessage()}`);
          throw criticalError;
        }
      }
      return astNodes;
    } catch (err) {
      // This catch block handles errors from astGenerator.generate() or re-thrown critical errors.
      if (err instanceof ParserError) {
        if (!this.errorHandler.getErrors().includes(err)) {
            this.errorHandler.addError(err);
        }
        this.logger.error(`ParserError during AST generation: ${err.getFormattedMessage()}`);
        if (this.throwOnError) throw err;
        return []; // Return empty AST if not throwing
      }

      // For other types of errors, wrap them
      const processingError = new ParserError(
        `Failed to generate AST due to an unexpected error: ${err instanceof Error ? err.message : String(err)}`,
        // @ts-expect-error - E002 is a placeholder for a real error code
        'E002', 
        Severity.ERROR,
        { source: code.length > 100 ? code.substring(0, 100) + '...' : code }
      );
      this.errorHandler.addError(processingError);
      this.logger.error(processingError.getFormattedMessage());
      if (this.throwOnError) throw processingError;
      return []; // Return empty AST if not throwing
    }
  }

  /**
   * Update an existing AST with new code changes.
   * @param currentAST The current abstract syntax tree.
   * @param changes An array of changes to apply to the code.
   * @returns The updated abstract syntax tree.
   */
  updateAST(
    currentAST: ASTNode[], 
    changes: any // TODO: Define actual change type, e.g., TextChange[] from web-tree-sitter
  ): ASTNode[] {
    this.logger.warn('[OpenscadParser.updateAST] Method not implemented. Returning current AST.');
    // TODO: Implement actual AST update logic based on changes. 
    // This might involve re-parsing sections of the code or patching the AST.
    return currentAST; 
  }

} // End of OpenscadParser class

