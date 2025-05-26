/**
 * @file Enhanced OpenSCAD parser with AST generation
 *
 * This extends the minimal parser to include AST generation functionality
 * while maintaining compatibility with the existing test infrastructure.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as TreeSitter from 'web-tree-sitter';
import { SimpleErrorHandler, IErrorHandler } from './error-handling/simple-error-handler';
import { ASTNode } from './ast/ast-types';
import { VisitorASTGenerator } from './ast/visitor-ast-generator';
import { ErrorHandler } from './error-handling';

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
      
      let resolvedWasmPath: string;
      if (path.isAbsolute(wasmPath)) {
          resolvedWasmPath = wasmPath;
      } else {
          // Try resolving relative to the current file, then try relative to process.cwd()
          const pathRelativeToCurrentFile = path.resolve(__dirname, wasmPath);
          if (fs.existsSync(pathRelativeToCurrentFile)) {
              resolvedWasmPath = pathRelativeToCurrentFile;
          } else {
              const pathRelativeToCwd = path.resolve(process.cwd(), wasmPath);
              if (fs.existsSync(pathRelativeToCwd)) {
                  resolvedWasmPath = pathRelativeToCwd;
              } else {
                  // Fallback for packages/openscad-parser/tree-sitter-openscad.wasm
                  // This path is relative to the project root if CWD is the project root.
                  const fallbackPath = path.resolve(process.cwd(), 'packages', 'openscad-parser', 'tree-sitter-openscad.wasm');
                  if (fs.existsSync(fallbackPath)) {
                      resolvedWasmPath = fallbackPath;
                  } else {
                     // Try one more fallback, directly in the 'dist' folder from potential CWD
                     const distFallbackPath = path.resolve(process.cwd(), 'dist', 'tree-sitter-openscad.wasm');
                     if (fs.existsSync(distFallbackPath)) {
                        resolvedWasmPath = distFallbackPath;
                     } else {
                       const finalFallback = path.resolve(__dirname, '../../../../node_modules/@openscad/tree-sitter-openscad/tree-sitter-openscad.wasm');
                       if(fs.existsSync(finalFallback)) {
                         resolvedWasmPath = finalFallback;
                       } else {
                         throw new Error(`WASM file not found. Checked: default '${wasmPath}', relative to __dirname '${pathRelativeToCurrentFile}', relative to CWD '${pathRelativeToCwd}', CWD/packages/openscad-parser '${fallbackPath}', CWD/dist '${distFallbackPath}', and node_modules relative to __dirname '${finalFallback}'.`);
                       }
                     }
                  }
              }
          }
      }
      this.errorHandler.logInfo(`Attempting to load OpenSCAD grammar WASM from: ${resolvedWasmPath}`);
      const openscadWasmBuffer = fs.readFileSync(resolvedWasmPath);

      // Resolve path for the generic tree-sitter.wasm
      const genericWasmName = 'tree-sitter.wasm';
      let resolvedGenericWasmPath: string;
      const grammarWasmDir = path.dirname(resolvedWasmPath);

      // 1. Attempt to resolve genericWasmName relative to the directory of the resolved OpenSCAD grammar WASM.
      const coLocatedGenericWasm = path.resolve(grammarWasmDir, genericWasmName);
      if (fs.existsSync(coLocatedGenericWasm)) {
        resolvedGenericWasmPath = coLocatedGenericWasm;
      } else {
        // 2. Fallback: try CWD/packages/openscad-parser/tree-sitter.wasm (if CWD is project root)
        const cwdPackagesPath = path.resolve(process.cwd(), 'packages', 'openscad-parser', genericWasmName);
        if (fs.existsSync(cwdPackagesPath)) {
          resolvedGenericWasmPath = cwdPackagesPath;
        } else {
          // 3. Fallback: try CWD/tree-sitter.wasm (if CWD is project root and wasm is there)
          const cwdPath = path.resolve(process.cwd(), genericWasmName);
          if (fs.existsSync(cwdPath)) {
            resolvedGenericWasmPath = cwdPath;
          } else {
            // 4. Fallback: node_modules/web-tree-sitter/tree-sitter.wasm relative to this file's __dirname
            // This path assumes enhanced-parser.ts is in src/lib/openscad-parser/
            const nodeModulesFallback = path.resolve(__dirname, '../../../../node_modules/web-tree-sitter/tree-sitter.wasm');
            if(fs.existsSync(nodeModulesFallback)) {
              resolvedGenericWasmPath = nodeModulesFallback;
            } else {
              throw new Error(
`Generic ${genericWasmName} not found. Checked:
1. Co-located with OpenSCAD WASM: ${coLocatedGenericWasm}
2. CWD/packages/openscad-parser/${genericWasmName}: ${cwdPackagesPath}
3. CWD/${genericWasmName}: ${cwdPath}
4. node_modules fallback: ${nodeModulesFallback}`
              );
            }
          }
        }
      }
      
      this.errorHandler.logInfo(`Initializing TreeSitter.Parser with generic WASM from: ${resolvedGenericWasmPath}`);
      
      await TreeSitter.Parser.init({
        locateFile: (scriptName: string, scriptDirectory: string) => {
          if (scriptName === 'tree-sitter.wasm') {
            return resolvedGenericWasmPath;
          }
          // For other files like tree-sitter.worker.js
          let workerPath = path.join(scriptDirectory, scriptName); // Default web-tree-sitter expects it here
          if (fs.existsSync(workerPath)) {
            return workerPath;
          }
          // Fallback to the directory of the resolvedGenericWasmPath (where tree-sitter.wasm is)
          workerPath = path.resolve(path.dirname(resolvedGenericWasmPath), scriptName);
          if (fs.existsSync(workerPath)) {
            return workerPath;
          }
          // Final fallback: CWD
          return path.resolve(process.cwd(), scriptName); 
        }
      });
      this.parser = new TreeSitter.Parser();
      this.language = await TreeSitter.Language.load(openscadWasmBuffer);
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
        this.errorHandler.logWarning('Syntax errors found in parsed code');
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
