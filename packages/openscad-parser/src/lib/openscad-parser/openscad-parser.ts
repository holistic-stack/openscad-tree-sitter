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
import * as TreeSitter from "web-tree-sitter";
import { VisitorASTGenerator } from "./ast/visitor-ast-generator";
import { ASTNode } from "./ast/ast-types";
// cstTreeCursorWalkLog is not used in this file
import { ParserError, SyntaxError, RecoveryStrategyFactory } from "./ast/errors"; // SemanticError is not used
import { ChangeTracker } from "./ast/changes/change-tracker"; // Change is not used

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
     * Whether the parser has been initialized
     */
    public isInitialized = false;

    /**
     * Initialize the parser by loading the WebAssembly file and setting up the language.
     * This must be called before using the parse method.
     *
     * @returns A promise that resolves when the parser is initialized, or rejects if there's an error
     * @param openscadWasmPath - Optional path to the WebAssembly file. If not provided, it will try to use the one from @openscad/tree-sitter-openscad
     */
    public async init(openscadWasmPath?: string): Promise<void> {
        try {
            const bytes = await fetch(openscadWasmPath || "./tree-sitter-openscad.wasm").then(
                (response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.bytes();
                }
            );

            // Initialize the TreeSitter parser
            await TreeSitter.Parser.init();
            this.parser = new TreeSitter.Parser();

            try {
                // Load the language from the WASM file
                this.language = await TreeSitter.Language.load(bytes);
                this.parser.setLanguage(this.language);
                this.isInitialized = true;
            } catch (err) {
                throw new Error(`Failed to load language: ${err}`);
            }
        } catch (err) {
            console.error("Failed to initialize OpenscadParser:", err);
            // Re-throw the error to ensure the promise returned by the async function rejects
            throw new Error(`Failed to initialize OpenscadParser: ${err}`);
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
    parseCST(code: string, previousTree?: TreeSitter.Tree | null): TreeSitter.Tree | null {
        if (!this.isInitialized || !this.parser) {
            // This case should still throw synchronously as it's a precondition failure
            throw new Error("Parser not initialized. Call init() first.");
        }

        try {
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
                    const position = {
                        line: errorNode.startPosition.row,
                        column: errorNode.startPosition.column,
                        offset: errorNode.startIndex
                    };

                    // Create a syntax error with the error node information
                    const error = new SyntaxError(
                        `Syntax error`,
                        code,
                        position,
                        [{ message: "Check the syntax around this area" }]
                    );

                    // Try to recover from the error
                    const strategy = RecoveryStrategyFactory.createStrategy(error);
                    if (strategy) {
                        const recoveredNode = strategy.recover(errorNode, error);
                        if (recoveredNode) {
                            console.log(`Recovered from syntax error at line ${position.line + 1}, column ${position.column + 1}`);
                            // In a real implementation, we would continue parsing from the recovered node
                            // For now, we'll just return the tree with errors
                        }
                    }

                    // Log the formatted error message
                    console.error(error.getFormattedMessage());
                }
            }

            return tree;
        } catch (err) {
            console.error("Failed to parse OpenSCAD code:", err);

            // If it's already a ParserError, just rethrow it
            if (err instanceof ParserError) {
                throw err;
            }

            // Otherwise, wrap it in a generic ParserError
            throw new ParserError(
                `Failed to parse OpenSCAD code: ${err}`,
                'PARSE_ERROR',
                code,
                { line: 0, column: 0, offset: 0 }
            );
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
    update(newCode: string, startIndex: number, oldEndIndex: number, newEndIndex: number): TreeSitter.Tree | null {
        if (!this.isInitialized || !this.parser) {
            throw new Error("Parser not initialized. Call init() first.");
        }

        if (!this.previousTree) {
            // If there's no previous tree, just parse from scratch
            return this.parseCST(newCode);
        }

        try {
            // Track the change
            const change = this.changeTracker.trackChange(startIndex, oldEndIndex, newEndIndex, newCode);

            // Apply the edit to the previous tree
            this.previousTree.edit(change);

            // Parse with the edited tree
            const newTree = this.parser.parse(newCode, this.previousTree);

            // Store the new tree for future incremental parsing
            this.previousTree = newTree;

            return newTree;
        } catch (err) {
            console.error("Failed to update parse tree:", err);

            // If it's already a ParserError, just rethrow it
            if (err instanceof ParserError) {
                throw err;
            }

            // Otherwise, wrap it in a generic ParserError
            throw new ParserError(
                `Failed to update parse tree: ${err}`,
                'UPDATE_ERROR',
                newCode,
                { line: 0, column: 0, offset: 0 }
            );
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
        const cst = this.parseCST(code);
        // cstTreeCursorWalkLog(cst?.walk(),code); // Commented out due to incorrect arguments causing TypeError
        if (!cst) {
            return [];
        }

        const generator = new VisitorASTGenerator(cst, code, this.language);
        return generator.generate();
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
    updateAST(newCode: string, startIndex: number, oldEndIndex: number, newEndIndex: number): ASTNode[] {
        // Update the CST first
        const updatedCST = this.update(newCode, startIndex, oldEndIndex, newEndIndex);
        if (!updatedCST) {
            return [];
        }

        // Get the changes since the last update
        // const changes = this.changeTracker.getChanges(); // Unused variable

        // Generate the AST with the changes
        const generator = new VisitorASTGenerator(updatedCST, newCode, this.language);

        // TODO: Implement incremental AST generation in VisitorASTGenerator
        // For now, just generate the AST from scratch
        return generator.generate();
    }

    /**
     * Parse OpenSCAD code and return a CST (Concrete Syntax Tree).
     * This is an alias for parseCST for backward compatibility.
     *
     * @param code - The OpenSCAD code to parse
     * @param previousTree - Optional previous parse tree for incremental parsing
     * @returns The parse tree or null
     */
    parse(code: string, previousTree?: TreeSitter.Tree | null): TreeSitter.Tree | null {
        return this.parseCST(code, previousTree);
    }

    /**
     * Dispose of the parser and free resources.
     * Call this when you're done with the parser to avoid memory leaks.
     */
    dispose(): void {
        if (this.parser) {
            this.parser.delete();
            this.parser = null;
            this.language = null;
            this.previousTree = null;
            this.changeTracker.clear();
            this.isInitialized = false;
        }
    }
}
